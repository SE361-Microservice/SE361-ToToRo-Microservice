package com.totoro.user.service;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.user.entity.User;
import com.totoro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCacheService {

    private final UserRepository userRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public Optional<User> findById(Long id) {
        Optional<User> localUser = userRepository.findById(id);
        if (localUser.isPresent()) {
            return localUser;
        }

        log.info("User {} not found in local user_cache. Attempting to fetch from identity-service via FeignClient.", id);
        try {
            UserProfileDto profile = userServiceClient.getUserProfile(id);
            if (profile != null && profile.getId() != null) {
                User user = User.builder()
                        .id(profile.getId())
                        .email(profile.getEmail())
                        .fullName(profile.getFullName() != null ? profile.getFullName() : profile.getEmail())
                        .avatarUrl(profile.getAvatarUrl())
                        .build();
                User saved = userRepository.saveAndFlush(user);
                log.info("Successfully fetched and cached user {} from identity-service", id);
                return Optional.of(saved);
            }
        } catch (Exception e) {
            log.error("Failed to fetch user {} from identity-service via FeignClient. Falling back to placeholder user.", id, e);
        }

        try {
            User placeholderUser = User.builder()
                    .id(id)
                    .email("placeholder-" + id + "@totoro.com")
                    .fullName("Người dùng " + id)
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + id)
                    .build();
            User saved = userRepository.saveAndFlush(placeholderUser);
            log.info("Successfully created placeholder user {} in local user_cache", id);
            return Optional.of(saved);
        } catch (Exception dbEx) {
            log.error("Failed to create placeholder user in local user_cache for id: {}", id, dbEx);
        }

        return Optional.empty();
    }
}
