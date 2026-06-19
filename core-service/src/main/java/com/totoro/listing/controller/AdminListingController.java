package com.totoro.listing.controller;

import com.totoro.listing.dto.ListingSummaryResponse;
import com.totoro.listing.dto.PageResponse;
import com.totoro.listing.entity.ListingStatus;
import com.totoro.listing.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/admin/listings")
@RequiredArgsConstructor
public class AdminListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getAllListingsForAdmin(
            @RequestParam(required = false) ListingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return ResponseEntity.ok(listingService.getAllListingsForAdmin(status, pageable));
    }
}
