package com.totoro.matching.dto;

import lombok.Data;

@Data
public class RoommateSearchRequest {
    private String university;
    private String district;
    private Long budgetMin;
    private Long budgetMax;
    private String sleepTime;
    private String gender;
    private Boolean okWithSmoker;
    private Boolean okWithPets;
}

