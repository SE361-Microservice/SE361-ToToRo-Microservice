package com.totoro.listing.dto;

import jakarta.validation.Valid;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateListingRequest {

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

    private Boolean isSharedOwner;
    private Short maxOccupants;
    private LocalDate availableFrom;

    @Valid
    private PolicyRequest policy;

    @Valid
    private List<FacilityRequest> facilities;

    @Valid
    private List<ImageRequest> images;

    private List<String> tagSlugs;
}
