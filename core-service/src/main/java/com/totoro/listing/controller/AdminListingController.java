package com.totoro.listing.controller;

import com.totoro.listing.dto.ListingSummaryResponse;
import com.totoro.listing.dto.PageResponse;
import com.totoro.listing.entity.ListingStatus;
import com.totoro.listing.service.ListingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * CQRS — Admin read-only controller for listing management.
 * Uses ListingQueryService (query side of CQRS).
 */
@RestController
@RequestMapping("/api/admin/listings")
@RequiredArgsConstructor
public class AdminListingController {

    private final ListingQueryService queryService;

    @GetMapping
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getAllListingsForAdmin(
            @RequestParam(required = false) ListingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(queryService.getAllListingsForAdmin(status, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Long>> getListingStats() {
        return ResponseEntity.ok(queryService.getListingStatsForAdmin());
    }
}
