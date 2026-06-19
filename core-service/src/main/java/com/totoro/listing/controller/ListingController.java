package com.totoro.listing.controller;

import com.totoro.listing.dto.*;
import com.totoro.listing.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    /**
     * Create a new listing. Only LANDLORD or ADMIN.
     */
    @PostMapping
    public ResponseEntity<ListingDetailResponse> createListing(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateListingRequest request) {
        ListingDetailResponse response = listingService.createListing(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update an existing listing. Owner only.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ListingDetailResponse> updateListing(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateListingRequest request) {
        return ResponseEntity.ok(listingService.updateListing(userId, id, request));
    }

    /**
     * Soft-delete (set INACTIVE). Owner or ADMIN.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteListing(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        listingService.deleteListing(userId, id);
        return ResponseEntity.ok("Listing has been deactivated");
    }

    /**
     * Get listing detail by ID. Public endpoint.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ListingDetailResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    /**
     * Get current user's listings (paginated).
     */
    @GetMapping("/my")
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getMyListings(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(listingService.getMyListings(userId, pageable));
    }

    /**
     * Get all pending listings. ADMIN only.
     */
        @GetMapping("/pending")
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getPendingListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(listingService.getPendingListings(pageable));
    }

    /**
     * Activate (approve) a listing. ADMIN only.
     */
        @PatchMapping("/{id}/activate")
    public ResponseEntity<ListingDetailResponse> activateListing(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.activateListing(id));
    }

    /**
     * Reject a listing. ADMIN only.
     */
        @PatchMapping("/{id}/reject")
    public ResponseEntity<ListingDetailResponse> rejectListing(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.rejectListing(id));
    }
}
