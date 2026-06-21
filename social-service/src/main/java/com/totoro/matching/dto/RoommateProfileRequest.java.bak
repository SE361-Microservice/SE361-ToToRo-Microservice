package com.totoro.matching.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class RoommateProfileRequest {
    @NotBlank
    private String headline;
    private String bio;
    private String preferredCity;
    private Long budgetMin;
    private Long budgetMax;
    private Boolean isActive = true;

    // Lifestyle fields
    private Integer age;
    private String gender;
    private List<String> preferredDistricts;
    private String sleepTime;
    private String wakeTime;

    @Min(1) @Max(5)
    private Integer cleanliness;

    private Boolean isSmoker;
    private Boolean drinksAlcohol;
    private Boolean hasPets;
    private Boolean isIntrovert;
    private Boolean okWithSmoker;
    private Boolean okWithPets;
}

