package com.totoro.listing.controller;

import com.totoro.listing.dto.ListingSearchRequest;
import com.totoro.listing.dto.ListingSummaryResponse;
import com.totoro.listing.dto.PageResponse;
import com.totoro.listing.service.ListingSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingSearchController {

    private final ListingSearchService listingSearchService;

    /**
     * Search listings with basic + advanced filters. Public endpoint.
     *
     * Basic filters: minPrice, maxPrice, district, city, roomType
     * Advanced filters: tagSlugs, latitude+longitude+radiusKm (Haversine)
     * Pagination: page, size, sortBy, sortDir
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<ListingSummaryResponse>> search(
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) List<String> tagSlugs,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radiusKm,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        ListingSearchRequest request = new ListingSearchRequest();
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setDistrict(district);
        request.setCity(city);
        request.setRoomType(roomType);
        request.setTagSlugs(tagSlugs);
        request.setLatitude(latitude);
        request.setLongitude(longitude);
        request.setRadiusKm(radiusKm);
        request.setPage(page);
        request.setSize(size);
        request.setSortBy(sortBy);
        request.setSortDir(sortDir);

        return ResponseEntity.ok(listingSearchService.search(request));
    }
}
