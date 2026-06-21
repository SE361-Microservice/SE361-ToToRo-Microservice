package com.totoro.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityResponse {
    private Long id;
    private String facilityType;
    private String name;
    private Boolean isIncluded;
    private String note;
}
