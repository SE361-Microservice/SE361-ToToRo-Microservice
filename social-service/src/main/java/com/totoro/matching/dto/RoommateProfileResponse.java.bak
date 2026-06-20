package com.totoro.matching.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommateProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String headline;
    private String bio;
    private String preferredCity;
    private Long budgetMin;
    private Long budgetMax;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined from UserProfile
    private String fullName;
    private String avatar;
    private String university;

    // Lifestyle fields
    private Integer age;
    private String gender;
    private List<String> preferredDistricts;
    private String sleepTime;
    private String wakeTime;
    private Integer cleanliness;
    private Boolean isSmoker;
    private Boolean drinksAlcohol;
    private Boolean hasPets;
    private Boolean isIntrovert;
    private Boolean okWithSmoker;
    private Boolean okWithPets;
}

