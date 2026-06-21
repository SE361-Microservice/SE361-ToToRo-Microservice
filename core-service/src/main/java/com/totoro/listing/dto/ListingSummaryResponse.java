package com.totoro.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingSummaryResponse {

    private Long id;
    private String title;
    private String address;
    private String district;
    private String city;
    private String roomType;

    private BigDecimal areaM2;
    private Long priceRent;

    private String coverImageUrl;
    private List<TagDto> tags;

    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double distanceKm; // populated when searching by distance

    private Double avgRating;
    private Integer reviewCount;
    private Boolean isSharedOwner;
    private Short maxOccupants;

    private LocalDateTime createdAt;
}
