package com.totoro.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingDetailResponse {

    private Long id;
    private Long landlordId;
    private String landlordName;

    private String title;
    private String description;
    private String address;
    private String district;
    private String city;

    private BigDecimal latitude;
    private BigDecimal longitude;

    private String roomType;
    private BigDecimal areaM2;

    private Long priceRent;
    private Long priceElectricity;
    private Long priceWater;
    private Long priceManagement;
    private Long priceParking;

    private String status;
    private Boolean isSharedOwner;
    private Short maxOccupants;
    private LocalDate availableFrom;

    private PolicyResponse policy;
    private List<FacilityResponse> facilities;
    private List<ImageResponse> images;
    private List<TagDto> tags;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
