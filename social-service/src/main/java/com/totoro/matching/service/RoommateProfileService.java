package com.totoro.matching.service;

import com.totoro.common.dto.PageResponse;
import com.totoro.matching.dto.RoommateProfileRequest;
import com.totoro.matching.dto.RoommateProfileResponse;
import com.totoro.matching.dto.RoommateSearchRequest;
import com.totoro.matching.entity.RoommateProfile;
import com.totoro.matching.repository.RoommateProfileRepository;
import com.totoro.user.entity.User;
import com.totoro.user.service.UserCacheService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoommateProfileService {

    private final RoommateProfileRepository roommateProfileRepository;
    private final UserCacheService userCacheService;

    @Transactional
    public RoommateProfileResponse upsert(Long userId, RoommateProfileRequest request) {
        User user = userCacheService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + userId));

        RoommateProfile profile = roommateProfileRepository.findByUserId(user.getId())
                .orElse(RoommateProfile.builder().user(user).build());

        profile.setHeadline(request.getHeadline());
        profile.setBio(request.getBio());
        profile.setPreferredCity(request.getPreferredCity());
        profile.setBudgetMin(request.getBudgetMin());
        profile.setBudgetMax(request.getBudgetMax());
        profile.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // Lifestyle fields
        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setPreferredDistricts(
                request.getPreferredDistricts() != null
                        ? String.join(",", request.getPreferredDistricts())
                        : null);
        profile.setSleepTime(request.getSleepTime());
        profile.setWakeTime(request.getWakeTime());
        profile.setCleanliness(request.getCleanliness());
        profile.setIsSmoker(request.getIsSmoker());
        profile.setDrinksAlcohol(request.getDrinksAlcohol());
        profile.setHasPets(request.getHasPets());
        profile.setIsIntrovert(request.getIsIntrovert());
        profile.setOkWithSmoker(request.getOkWithSmoker());
        profile.setOkWithPets(request.getOkWithPets());

        return toResponse(roommateProfileRepository.save(profile));
    }

    public RoommateProfileResponse getMyProfile(Long userId) {
        RoommateProfile profile = roommateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Bạn chưa có hồ sơ roommate"));
        return toResponse(profile);
    }

    public RoommateProfileResponse getById(Long profileId) {
        RoommateProfile profile = roommateProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ roommate"));
        return toResponse(profile);
    }

    public RoommateProfileResponse getByUserId(Long userId) {
        RoommateProfile profile = roommateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User chưa có hồ sơ roommate"));
        return toResponse(profile);
    }

    @Transactional
    public void deleteMyProfile(Long userId) {
        RoommateProfile profile = roommateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Bạn chưa có hồ sơ roommate"));
        roommateProfileRepository.delete(profile);
    }

    public List<RoommateProfileResponse> getFeed(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RoommateProfile> profiles = roommateProfileRepository.findByUserIdNotAndIsActiveTrue(userId, pageable);
        return profiles.getContent().stream()
                .map(this::toResponse)
                .toList();
    }

    public PageResponse<RoommateProfileResponse> search(RoommateSearchRequest request, Pageable pageable) {
        Specification<RoommateProfile> spec = buildSearchSpec(request);
        Page<RoommateProfile> page = roommateProfileRepository.findAll(spec, pageable);

        List<RoommateProfileResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.<RoommateProfileResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    // ==================== Specification Builder ====================

    private Specification<RoommateProfile> buildSearchSpec(RoommateSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only active profiles
            predicates.add(cb.isTrue(root.get("isActive")));

            if (request.getGender() != null && !request.getGender().isBlank()) {
                predicates.add(cb.equal(root.get("gender"), request.getGender()));
            }

            if (request.getSleepTime() != null && !request.getSleepTime().isBlank()) {
                predicates.add(cb.equal(root.get("sleepTime"), request.getSleepTime()));
            }

            if (request.getBudgetMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("budgetMax"), request.getBudgetMin()));
            }

            if (request.getBudgetMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("budgetMin"), request.getBudgetMax()));
            }

            if (request.getOkWithSmoker() != null) {
                predicates.add(cb.equal(root.get("okWithSmoker"), request.getOkWithSmoker()));
            }

            if (request.getOkWithPets() != null) {
                predicates.add(cb.equal(root.get("okWithPets"), request.getOkWithPets()));
            }

            if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("preferredDistricts")),
                        "%" + request.getDistrict().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // ==================== Mapper ====================

    private RoommateProfileResponse toResponse(RoommateProfile profile) {
        User user = profile.getUser();

        // Convert comma-separated districts to list
        List<String> districts = profile.getPreferredDistricts() != null
                ? Arrays.asList(profile.getPreferredDistricts().split(","))
                : Collections.emptyList();

        return RoommateProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .preferredCity(profile.getPreferredCity())
                .budgetMin(profile.getBudgetMin())
                .budgetMax(profile.getBudgetMax())
                .isActive(profile.getIsActive())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                // Use user_cache fields for display info
                .fullName(user.getFullName())
                .avatar(user.getAvatarUrl())
                .university(null)   // university not stored in user_cache; populated by identity-service via Kafka if needed
                // Lifestyle fields
                .age(profile.getAge())
                .gender(profile.getGender())
                .preferredDistricts(districts)
                .sleepTime(profile.getSleepTime())
                .wakeTime(profile.getWakeTime())
                .cleanliness(profile.getCleanliness())
                .isSmoker(profile.getIsSmoker())
                .drinksAlcohol(profile.getDrinksAlcohol())
                .hasPets(profile.getHasPets())
                .isIntrovert(profile.getIsIntrovert())
                .okWithSmoker(profile.getOkWithSmoker())
                .okWithPets(profile.getOkWithPets())
                .build();
    }
}
