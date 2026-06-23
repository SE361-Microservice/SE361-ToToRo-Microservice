package com.totoro.listing.service;

import com.totoro.listing.dto.PageResponse;
import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.listing.dto.*;
import com.totoro.listing.entity.*;
import com.totoro.listing.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CQRS — Query Side.
 * Handles all read-only operations: get by ID, search, pagination.
 * No state changes, no outbox events.
 *
 * The listing_cache in social-service is the CQRS read model for cross-service reads
 * (e.g., social-service looking up a listing title when displaying a review).
 * Core-service's own reads still hit core_db directly via this service.
 *
 * @see ListingCommandService for the write side.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ListingQueryService {

    private final ListingRepository listingRepository;
    private final UserServiceClient userServiceClient;
    private final ListingCommandService commandService; // shared mapper helpers

    // ==================== PUBLIC READ ====================

    public ListingDetailResponse getListingById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
        return commandService.toDetailResponse(listing);
    }

    public PageResponse<ListingSummaryResponse> getMyListings(Long userId, Pageable pageable) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Page<Listing> page = listingRepository.findByLandlordId(user.getId(), pageable);
        return toPageResponse(page);
    }

    // ==================== ADMIN READ ====================

    public PageResponse<ListingSummaryResponse> getPendingListings(Pageable pageable) {
        return toPageResponse(listingRepository.findByStatus(ListingStatus.PENDING, pageable));
    }

    public PageResponse<ListingSummaryResponse> getAllListingsForAdmin(ListingStatus status, Pageable pageable) {
        Page<Listing> page = (status != null)
                ? listingRepository.findByStatus(status, pageable)
                : listingRepository.findAll(pageable);
        return toPageResponse(page);
    }

    public java.util.Map<String, Long> getListingStatsForAdmin() {
        List<Object[]> results = listingRepository.countListingsByStatus();
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        for (Object[] result : results) {
            ListingStatus status = (ListingStatus) result[0];
            Long count = ((Number) result[1]).longValue();
            stats.put(status.name(), count);
        }
        return stats;
    }

    // ==================== MAPPERS ====================

    public ListingSummaryResponse toSummaryResponse(Listing listing) {
        String coverUrl = null;
        if (listing.getImages() != null) {
            coverUrl = listing.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsCover()))
                    .findFirst()
                    .map(ListingImage::getUrl)
                    .orElse(listing.getImages().stream().findFirst().map(ListingImage::getUrl).orElse(null));
        }

        return ListingSummaryResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .address(listing.getAddress())
                .district(listing.getDistrict())
                .city(listing.getCity())
                .roomType(listing.getRoomType())
                .areaM2(listing.getAreaM2())
                .priceRent(listing.getPriceRent())
                .coverImageUrl(coverUrl)
                .tags(listing.getTags() != null
                        ? listing.getTags().stream().map(this::toTagDto).toList()
                        : List.of())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .isSharedOwner(listing.getIsSharedOwner())
                .maxOccupants(listing.getMaxOccupants())
                .reviewCount(0) // Ratings live in social-service; enrich via social API if needed
                .createdAt(listing.getCreatedAt())
                .build();
    }

    public PageResponse<ListingSummaryResponse> toPageResponse(Page<Listing> page) {
        List<ListingSummaryResponse> content = page.getContent().stream()
                .map(this::toSummaryResponse)
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

    private TagDto toTagDto(Tag t) {
        return TagDto.builder().id(t.getId()).name(t.getName()).slug(t.getSlug()).build();
    }
}
