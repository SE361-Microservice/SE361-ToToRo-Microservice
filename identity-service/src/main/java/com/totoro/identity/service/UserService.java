package com.totoro.identity.service;

import com.totoro.common.dto.PageResponse;
import com.totoro.common.dto.UserProfileDto;
import com.totoro.common.enums.Role;
import com.totoro.identity.dto.ChangePasswordRequest;
import com.totoro.identity.dto.UpdateProfileRequest;
import com.totoro.identity.dto.UserProfileResponse;
import com.totoro.identity.entity.AuthProvider;
import com.totoro.identity.entity.User;
import com.totoro.identity.entity.UserProfile;
import com.totoro.identity.event.UserEventPublisher;
import com.totoro.identity.repository.UserProfileRepository;
import com.totoro.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserEventPublisher userEventPublisher;

    // ===================== EXTERNAL (FE via Gateway) =====================

    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = findUserByEmailOrThrow(email);
        UserProfile profile = findProfileByUserIdOrThrow(user.getId());
        return toResponse(user, profile);
    }

    public UserProfileResponse getUserProfileById(Long userId) {
        User user = findUserByIdOrThrow(userId);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy profile cho user: " + userId));
        return toResponse(user, profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmailOrThrow(email);
        UserProfile profile = findProfileByUserIdOrThrow(user.getId());

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getUniversity() != null) profile.setUniversity(request.getUniversity());

        userProfileRepository.save(profile);

        // Publish event so social-service can sync its local user_cache (CQRS read model)
        try {
            userEventPublisher.publishUserUpdated(
                    user.getId(),
                    user.getEmail(),
                    profile.getFullName(),
                    profile.getAvatarUrl()
            );
        } catch (Exception e) {
            // Non-critical: event publish failure must not rollback profile update
            log.warn("Failed to publish user-updated event for userId={}: {}", user.getId(), e.getMessage());
        }

        return toResponse(user, profile);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findUserByEmailOrThrow(email);

        if (!user.getProvider().equals(AuthProvider.LOCAL)) {
            throw new IllegalArgumentException("Tài khoản OAuth2 không thể thay đổi mật khẩu");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Sai mật khẩu cũ");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = findUserByEmailOrThrow(email);
        userRepository.delete(user); // Cascade deletes profile
    }

    // ===================== ADMIN =====================

    public PageResponse<UserProfileResponse> getAllUsersForAdmin(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        List<UserProfileResponse> content = page.getContent().stream().map(user -> {
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
            return toResponse(user, profile);
        }).collect(Collectors.toList());

        return PageResponse.<UserProfileResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional
    public void changeUserRole(Long userId, String newRole) {
        User user = findUserByIdOrThrow(userId);
        // Validate role
        if (!List.of("USER", "LANDLORD", "ADMIN").contains(newRole.toUpperCase())) {
            throw new IllegalArgumentException("Role không hợp lệ: " + newRole);
        }
        user.setRole(newRole.toUpperCase());
        userRepository.save(user);
    }

    @Transactional
    public void changeUserBlockStatus(Long userId, boolean block) {
        User user = findUserByIdOrThrow(userId);
        user.setIsBlocked(block);
        userRepository.save(user);
    }

    // ===================== INTERNAL (for other services) =====================

    /**
     * Returns the lightweight UserProfileDto from common.jar.
     * Used by Core/Social services via FeignClient to display user info alongside their data.
     */
    public UserProfileDto getInternalUserProfile(Long userId) {
        User user = findUserByIdOrThrow(userId);
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(parseRole(user.getRole()))
                .fullName(profile != null ? profile.getFullName() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .build();
    }

    /**
     * Batch fetch - returns Map<userId, UserProfileDto>.
     * Used by Chat/Social service to load member info of a conversation in one call.
     */
    public Map<Long, UserProfileDto> getBatchInternalUserProfiles(List<Long> userIds) {
        List<User> users = userRepository.findAllById(userIds);
        List<UserProfile> profiles = userProfileRepository.findAllByUserIdIn(userIds);

        Map<Long, UserProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), p -> p));

        return users.stream().collect(Collectors.toMap(
                User::getId,
                user -> {
                    UserProfile profile = profileMap.get(user.getId());
                    return UserProfileDto.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .role(parseRole(user.getRole()))
                            .fullName(profile != null ? profile.getFullName() : null)
                            .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                            .build();
                }
        ));
    }

    public boolean existsById(Long userId) {
        return userRepository.existsById(userId);
    }

    // ===================== PRIVATE HELPERS =====================

    private User findUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user với email: " + email));
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user với ID: " + userId));
    }

    private UserProfile findProfileByUserIdOrThrow(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy profile"));
    }

    private UserProfileResponse toResponse(User user, UserProfile profile) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(profile != null ? profile.getFullName() : null)
                .phone(profile != null ? profile.getPhone() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .bio(profile != null ? profile.getBio() : null)
                .university(profile != null ? profile.getUniversity() : null)
                .isBlocked(user.getIsBlocked())
                .build();
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role);
        } catch (Exception e) {
            return Role.USER;
        }
    }
}
