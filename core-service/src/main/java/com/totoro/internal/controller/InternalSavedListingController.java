package com.totoro.internal.controller;

import com.totoro.internal.dto.InternalSaveListingRequest;
import com.totoro.listing.service.SavedListingService;
import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.common.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

/**
 * Internal API for AI Service to save listings on behalf of users.
 * Auth handled by InternalApiKeyFilter (X-Internal-Key header).
 */
@RestController
@RequestMapping("/api/internal/saved-listings")
@RequiredArgsConstructor
public class InternalSavedListingController {

    private final SavedListingService savedListingService;
    private final UserServiceClient userServiceClient;

    @PostMapping
    public ResponseEntity<Map<String, Object>> saveListing(@RequestBody InternalSaveListingRequest request) {
        UserProfileDto user = userServiceClient.getUserProfile(request.getUserId());
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + request.getUserId());
        }
        boolean saved = savedListingService.toggleSave(request.getUserId(), request.getListingId());
        return ResponseEntity.ok(Map.of(
                "saved", saved,
                "message", saved ? "Listing saved" : "Listing unsaved"
        ));
    }
}
