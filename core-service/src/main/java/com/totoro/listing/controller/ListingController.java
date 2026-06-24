package com.totoro.listing.controller;

import com.totoro.listing.dto.*;
import com.totoro.listing.service.ListingCommandService;
import com.totoro.listing.service.ListingQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for listing operations.
 * Follows CQRS: write endpoints delegate to ListingCommandService,
 * read endpoints delegate to ListingQueryService.
 */
@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    // CQRS: separate command and query services
    private final ListingCommandService commandService;
    private final ListingQueryService queryService;

    // ===== COMMANDS (writes) =====

    @PostMapping
    public ResponseEntity<ListingDetailResponse> createListing(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commandService.createListing(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingDetailResponse> updateListing(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateListingRequest request) {
        return ResponseEntity.ok(commandService.updateListing(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteListing(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        commandService.deleteListing(userId, id);
        return ResponseEntity.ok("Listing has been deactivated");
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ListingDetailResponse> activateListing(@PathVariable Long id) {
        return ResponseEntity.ok(commandService.activateListing(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ListingDetailResponse> rejectListing(@PathVariable Long id) {
        return ResponseEntity.ok(commandService.rejectListing(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViewCount(@PathVariable Long id) {
        // Stub: Not implemented in DB schema yet, returning 200 OK
        return ResponseEntity.ok().build();
    }

    // ===== QUERIES (reads) =====

    @GetMapping("/{id}")
    public ResponseEntity<ListingDetailResponse> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getListingById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getMyListings(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(queryService.getMyListings(userId, pageable));
    }

    @GetMapping("/pending")
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getPendingListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(queryService.getPendingListings(pageable));
    }
}
