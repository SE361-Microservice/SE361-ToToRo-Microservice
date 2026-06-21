package com.totoro.listing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateListingRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String address;

    @NotBlank
    private String district;

    @NotBlank
    private String city;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @NotBlank
    private String roomType;

    private BigDecimal areaM2;

    @NotNull
    @Positive
    private Long priceRent;

    private Long priceElectricity;
    private Long priceWater;
    private Long priceManagement;
    private Long priceParking;

    private Boolean isSharedOwner = false;
    private Short maxOccupants;
    private LocalDate availableFrom;

    // --- Nested ---

    @Valid
    private PolicyRequest policy;

    @Valid
    private List<FacilityRequest> facilities;

    @Valid
    private List<ImageRequest> images;

    private List<String> tagSlugs;
}
