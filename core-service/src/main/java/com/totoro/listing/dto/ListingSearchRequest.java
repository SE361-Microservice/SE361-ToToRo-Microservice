package com.totoro.listing.dto;

import lombok.Data;

import java.util.List;

@Data
public class ListingSearchRequest {

    // --- Basic filters ---
    private Long minPrice;
    private Long maxPrice;
    private String district;
    private String city;
    private String roomType;

    // --- Advanced filters ---
    private List<String> tagSlugs;
    private Double latitude;
    private Double longitude;
    private Double radiusKm;

    // --- Pagination ---
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
}
