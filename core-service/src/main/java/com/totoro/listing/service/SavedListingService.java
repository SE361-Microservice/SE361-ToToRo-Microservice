package com.totoro.listing.service;

import com.totoro.listing.dto.ListingSummaryResponse;
import com.totoro.listing.dto.PageResponse;
import com.totoro.listing.entity.Listing;
import com.totoro.listing.entity.SavedListing;
import com.totoro.listing.repository.ListingRepository;
import com.totoro.listing.repository.SavedListingRepository;
import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.common.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedListingService {

    private final SavedListingRepository savedListingRepository;
    private final ListingRepository listingRepository;
    private final UserServiceClient userServiceClient;
    private final ListingService listingService;

    /**
     * Toggle save/unsave a listing for the current user.
     * Returns true if saved, false if unsaved.
     */
    @Transactional
    public boolean toggleSave(Long userId, Long listingId) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (savedListingRepository.existsByUserIdAndListingId(user.getId(), listingId)) {
            savedListingRepository.deleteByUserIdAndListingId(user.getId(), listingId);
            return false; // unsaved
        } else {
            SavedListing saved = SavedListing.builder()
                    .userId(user.getId())
                    .listing(listing)
                    .build();
            savedListingRepository.save(saved);
            return true; // saved
        }
    }

    public PageResponse<ListingSummaryResponse> getSavedListings(Long userId, Pageable pageable) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Page<SavedListing> page = savedListingRepository.findByUserId(user.getId(), pageable);

        List<ListingSummaryResponse> content = page.getContent().stream()
                .map(sl -> listingService.toSummaryResponse(sl.getListing()))
                .collect(Collectors.toList());

        return PageResponse.<ListingSummaryResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public boolean isListingSaved(Long userId, Long listingId) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        return savedListingRepository.existsByUserIdAndListingId(user.getId(), listingId);
    }
}
