package com.totoro.listing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FacilityRequest {

    @NotBlank
    private String facilityType;

    @NotBlank
    private String name;

    private Boolean isIncluded = true;

    private String note;
}
