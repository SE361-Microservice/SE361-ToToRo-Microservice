package com.totoro.listing.controller;

import com.totoro.listing.dto.ListingSummaryResponse;
import com.totoro.listing.dto.PageResponse;
import com.totoro.listing.service.SavedListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@RestController
@RequestMapping("/api/saved-listings")
@RequiredArgsConstructor
public class SavedListingController {

    private final SavedListingService savedListingService;

    /**
     * Toggle save/unsave a listing.
     */
    @PostMapping("/{listingId}")
    public ResponseEntity<Map<String, Object>> toggleSave(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long listingId) {
        boolean saved = savedListingService.toggleSave(userId, listingId);
        return ResponseEntity.ok(Map.of(
                "saved", saved,
                "message", saved ? "Listing saved" : "Listing unsaved"
        ));
    }

    /**
     * Get saved listings (paginated).
     */
    @GetMapping
    public ResponseEntity<PageResponse<ListingSummaryResponse>> getSavedListings(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(savedListingService.getSavedListings(userId, pageable));
    }

    /**
     * Check if a listing is saved by current user.
     */
    @GetMapping("/{listingId}/check")
    public ResponseEntity<Map<String, Boolean>> checkSaved(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long listingId) {
        boolean saved = savedListingService.isListingSaved(userId, listingId);
        return ResponseEntity.ok(Map.of("saved", saved));
    }
}
