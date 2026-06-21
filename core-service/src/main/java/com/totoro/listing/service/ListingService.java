package com.totoro.listing.service;

import com.totoro.listing.dto.*;
import com.totoro.listing.entity.*;
import com.totoro.listing.repository.ListingRepository;
import com.totoro.listing.repository.TagRepository;
import com.totoro.review.repository.ReviewRepository;
import com.totoro.internal.service.AiServiceWebhookClient;
import com.totoro.outbox.entity.OutboxEvent;
import com.totoro.outbox.entity.OutboxEventStatus;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.common.dto.UserProfileDto;

import com.totoro.internal.user.UserServiceClient;
import com.totoro.common.dto.UserProfileDto;
import com.totoro.common.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final TagRepository tagRepository;
    private final UserServiceClient userServiceClient;
    
    private final ReviewRepository reviewRepository;
    private final AiServiceWebhookClient aiServiceWebhookClient;
    private final com.totoro.outbox.repository.OutboxEventRepository outboxEventRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    // ==================== CREATE ====================

    @Transactional
    public ListingDetailResponse createListing(Long userId, CreateListingRequest request) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);

        if (user.getRole() != Role.LANDLORD && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only landlords can create listings");
        }

        Listing listing = Listing.builder()
                .landlordId(user.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .district(request.getDistrict())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .roomType(request.getRoomType())
                .areaM2(request.getAreaM2())
                .priceRent(request.getPriceRent())
                .priceElectricity(request.getPriceElectricity())
                .priceWater(request.getPriceWater())
                .priceManagement(request.getPriceManagement())
                .priceParking(request.getPriceParking())
                .isSharedOwner(request.getIsSharedOwner() != null ? request.getIsSharedOwner() : false)
                .maxOccupants(request.getMaxOccupants())
                .availableFrom(request.getAvailableFrom())
                .status(ListingStatus.PENDING)
                .build();

        // Policy (1:1)
        if (request.getPolicy() != null) {
            ListingPolicy policy = mapPolicyFromRequest(request.getPolicy());
            listing.setPolicy(policy);
        }

        // Facilities
        if (request.getFacilities() != null) {
            for (FacilityRequest fr : request.getFacilities()) {
                ListingFacility facility = ListingFacility.builder()
                        .facilityType(fr.getFacilityType())
                        .name(fr.getName())
                        .isIncluded(fr.getIsIncluded() != null ? fr.getIsIncluded() : true)
                        .note(fr.getNote())
                        .build();
                listing.addFacility(facility);
            }
        }

        // Images
        if (request.getImages() != null) {
            for (ImageRequest ir : request.getImages()) {
                ListingImage image = ListingImage.builder()
                        .url(ir.getUrl())
                        .isCover(ir.getIsCover() != null ? ir.getIsCover() : false)
                        .sortOrder(ir.getSortOrder() != null ? ir.getSortOrder() : 0)
                        .build();
                listing.addImage(image);
            }
        }

        // Tags
        if (request.getTagSlugs() != null && !request.getTagSlugs().isEmpty()) {
            List<Tag> tags = tagRepository.findBySlugIn(request.getTagSlugs());
            listing.setTags(new HashSet<>(tags));
        }

        listing = listingRepository.save(listing);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("listingId", listing.getId());
            payload.put("landlordId", listing.getLandlordId());
            payload.put("status", listing.getStatus().name());

            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .aggregateType("LISTING")
                    .aggregateId(String.valueOf(listing.getId()))
                    .eventType("LISTING_CREATED")
                    .payload(objectMapper.writeValueAsString(payload))
                    .status(OutboxEventStatus.PENDING)
                    .build();
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save outbox event", e);
        }

        return toDetailResponse(listing);
    }

    // ==================== UPDATE ====================

    @Transactional
    public ListingDetailResponse updateListing(Long userId, Long id, UpdateListingRequest request) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Listing listing = findListingById(id);

        checkOwnership(user, listing);

        // Update basic fields
        if (request.getTitle() != null)
            listing.setTitle(request.getTitle());
        if (request.getDescription() != null)
            listing.setDescription(request.getDescription());
        if (request.getAddress() != null)
            listing.setAddress(request.getAddress());
        if (request.getDistrict() != null)
            listing.setDistrict(request.getDistrict());
        if (request.getCity() != null)
            listing.setCity(request.getCity());
        if (request.getLatitude() != null)
            listing.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            listing.setLongitude(request.getLongitude());
        if (request.getRoomType() != null)
            listing.setRoomType(request.getRoomType());
        if (request.getAreaM2() != null)
            listing.setAreaM2(request.getAreaM2());
        if (request.getPriceRent() != null)
            listing.setPriceRent(request.getPriceRent());
        if (request.getPriceElectricity() != null)
            listing.setPriceElectricity(request.getPriceElectricity());
        if (request.getPriceWater() != null)
            listing.setPriceWater(request.getPriceWater());
        if (request.getPriceManagement() != null)
            listing.setPriceManagement(request.getPriceManagement());
        if (request.getPriceParking() != null)
            listing.setPriceParking(request.getPriceParking());
        if (request.getIsSharedOwner() != null)
            listing.setIsSharedOwner(request.getIsSharedOwner());
        if (request.getMaxOccupants() != null)
            listing.setMaxOccupants(request.getMaxOccupants());
        if (request.getAvailableFrom() != null)
            listing.setAvailableFrom(request.getAvailableFrom());

        // Update policy (replace)
        if (request.getPolicy() != null) {
            ListingPolicy policy = listing.getPolicy();
            if (policy == null) {
                policy = mapPolicyFromRequest(request.getPolicy());
                listing.setPolicy(policy);
            } else {
                updatePolicyFromRequest(policy, request.getPolicy());
            }
        }

        // Update facilities (replace all)
        if (request.getFacilities() != null) {
            listing.getFacilities().clear();
            for (FacilityRequest fr : request.getFacilities()) {
                ListingFacility facility = ListingFacility.builder()
                        .facilityType(fr.getFacilityType())
                        .name(fr.getName())
                        .isIncluded(fr.getIsIncluded() != null ? fr.getIsIncluded() : true)
                        .note(fr.getNote())
                        .build();
                listing.addFacility(facility);
            }
        }

        // Update images (replace all)
        if (request.getImages() != null) {
            listing.getImages().clear();
            for (ImageRequest ir : request.getImages()) {
                ListingImage image = ListingImage.builder()
                        .url(ir.getUrl())
                        .isCover(ir.getIsCover() != null ? ir.getIsCover() : false)
                        .sortOrder(ir.getSortOrder() != null ? ir.getSortOrder() : 0)
                        .build();
                listing.addImage(image);
            }
        }

        // Update tags (replace all)
        if (request.getTagSlugs() != null) {
            List<Tag> tags = tagRepository.findBySlugIn(request.getTagSlugs());
            listing.setTags(new HashSet<>(tags));
        }

        // Reset status to PENDING on update
        listing.setStatus(ListingStatus.PENDING);

        listing = listingRepository.save(listing);
        return toDetailResponse(listing);
    }

    // ==================== DELETE ====================

    @Transactional
    public void deleteListing(Long userId, Long id) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Listing listing = findListingById(id);

        if (user.getRole() != Role.ADMIN) {
            checkOwnership(user, listing);
        }

        listing.setStatus(ListingStatus.INACTIVE);
        listingRepository.save(listing);
    }

    // ==================== READ ====================

    public ListingDetailResponse getListingById(Long id) {
        Listing listing = findListingById(id);
        return toDetailResponse(listing);
    }

    public PageResponse<ListingSummaryResponse> getMyListings(Long userId, Pageable pageable) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Page<Listing> page = listingRepository.findByLandlordId(user.getId(), pageable);
        return toPageResponse(page);
    }

    // ==================== ADMIN ====================

    public PageResponse<ListingSummaryResponse> getPendingListings(Pageable pageable) {
        Page<Listing> page = listingRepository.findByStatus(ListingStatus.PENDING, pageable);
        return toPageResponse(page);
    }

    public PageResponse<ListingSummaryResponse> getAllListingsForAdmin(ListingStatus status, Pageable pageable) {
        Page<Listing> page;
        if (status != null) {
            page = listingRepository.findByStatus(status, pageable);
        } else {
            page = listingRepository.findAll(pageable);
        }
        return toPageResponse(page);
    }

    @Transactional
    public ListingDetailResponse activateListing(Long id) {
        Listing listing = findListingById(id);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);

        // Notify AI Service about new active listing (async, non-blocking)
        aiServiceWebhookClient.notifyNewListing(listing);

        return toDetailResponse(listing);
    }

    @Transactional
    public ListingDetailResponse rejectListing(Long id) {
        Listing listing = findListingById(id);
        listing.setStatus(ListingStatus.REJECTED);
        listingRepository.save(listing);
        return toDetailResponse(listing);
    }

    // ==================== HELPERS ====================

    private Listing findListingById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
    }

    private void checkOwnership(UserProfileDto user, Listing listing) {
        if (!listing.getLandlordId().equals(user.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this listing");
        }
    }

    private ListingPolicy mapPolicyFromRequest(PolicyRequest req) {
        return ListingPolicy.builder()
                .depositMonths(req.getDepositMonths())
                .contractType(req.getContractType())
                .allowsResidenceReg(req.getAllowsResidenceReg() != null ? req.getAllowsResidenceReg() : false)
                .checkinTime(req.getCheckinTime())
                .checkoutTime(req.getCheckoutTime())
                .allowsGuests(req.getAllowsGuests() != null ? req.getAllowsGuests() : true)
                .allowsPets(req.getAllowsPets() != null ? req.getAllowsPets() : false)
                .allowsCooking(req.getAllowsCooking() != null ? req.getAllowsCooking() : true)
                .referralPolicy(req.getReferralPolicy())
                .otherRules(req.getOtherRules())
                .build();
    }

    private void updatePolicyFromRequest(ListingPolicy policy, PolicyRequest req) {
        if (req.getDepositMonths() != null)
            policy.setDepositMonths(req.getDepositMonths());
        if (req.getContractType() != null)
            policy.setContractType(req.getContractType());
        if (req.getAllowsResidenceReg() != null)
            policy.setAllowsResidenceReg(req.getAllowsResidenceReg());
        if (req.getCheckinTime() != null)
            policy.setCheckinTime(req.getCheckinTime());
        if (req.getCheckoutTime() != null)
            policy.setCheckoutTime(req.getCheckoutTime());
        if (req.getAllowsGuests() != null)
            policy.setAllowsGuests(req.getAllowsGuests());
        if (req.getAllowsPets() != null)
            policy.setAllowsPets(req.getAllowsPets());
        if (req.getAllowsCooking() != null)
            policy.setAllowsCooking(req.getAllowsCooking());
        if (req.getReferralPolicy() != null)
            policy.setReferralPolicy(req.getReferralPolicy());
        if (req.getOtherRules() != null)
            policy.setOtherRules(req.getOtherRules());
    }

    // ==================== MAPPERS ====================

    public ListingDetailResponse toDetailResponse(Listing listing) {
        String landlordName = "";
        try {
            UserProfileDto profile = userServiceClient.getUserProfile(listing.getLandlordId());
            if (profile != null) {
                landlordName = profile.getFullName();
            }
        } catch (Exception ignored) {
        }

        return ListingDetailResponse.builder()
                .id(listing.getId())
                .landlordId(listing.getLandlordId())
                .landlordName(landlordName)
                .title(listing.getTitle())
                .description(listing.getDescription())
                .address(listing.getAddress())
                .district(listing.getDistrict())
                .city(listing.getCity())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .roomType(listing.getRoomType())
                .areaM2(listing.getAreaM2())
                .priceRent(listing.getPriceRent())
                .priceElectricity(listing.getPriceElectricity())
                .priceWater(listing.getPriceWater())
                .priceManagement(listing.getPriceManagement())
                .priceParking(listing.getPriceParking())
                .status(listing.getStatus().name())
                .isSharedOwner(listing.getIsSharedOwner())
                .maxOccupants(listing.getMaxOccupants())
                .availableFrom(listing.getAvailableFrom())
                .policy(listing.getPolicy() != null ? toPolicyResponse(listing.getPolicy()) : null)
                .facilities(listing.getFacilities() != null
                        ? listing.getFacilities().stream().map(this::toFacilityResponse).collect(Collectors.toList())
                        : List.of())
                .images(listing.getImages() != null
                        ? listing.getImages().stream().map(this::toImageResponse).collect(Collectors.toList())
                        : List.of())
                .tags(listing.getTags() != null
                        ? listing.getTags().stream().map(this::toTagDto).collect(Collectors.toList())
                        : List.of())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

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
                        ? listing.getTags().stream().map(this::toTagDto).collect(Collectors.toList())
                        : List.of())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .isSharedOwner(listing.getIsSharedOwner())
                .maxOccupants(listing.getMaxOccupants())
                .createdAt(listing.getCreatedAt())
                .build();
    }

    public PageResponse<ListingSummaryResponse> toPageResponse(Page<Listing> page) {
        List<ListingSummaryResponse> content = page.getContent().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        // Batch enrich with avg rating and review count
        enrichWithRatings(content, page.getContent());

        return PageResponse.<ListingSummaryResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    /**
     * Batch query ratings for a list of listings and populate into summary responses.
     * Avoids N+1 queries by fetching all ratings in a single query.
     */
    private void enrichWithRatings(List<ListingSummaryResponse> responses, List<Listing> listings) {
        if (responses.isEmpty()) return;

        List<Long> listingIds = listings.stream().map(Listing::getId).collect(Collectors.toList());
        List<Object[]> ratingData = reviewRepository.findAvgRatingAndCountByListingIds(listingIds);

        // Build map: listingId -> [avgRating, count]
        Map<Long, Object[]> ratingMap = new HashMap<>();
        for (Object[] row : ratingData) {
            ratingMap.put((Long) row[0], row);
        }

        for (ListingSummaryResponse response : responses) {
            Object[] data = ratingMap.get(response.getId());
            if (data != null) {
                response.setAvgRating(((Number) data[1]).doubleValue());
                response.setReviewCount(((Number) data[2]).intValue());
            } else {
                response.setAvgRating(null);
                response.setReviewCount(0);
            }
        }
    }

    private PolicyResponse toPolicyResponse(ListingPolicy p) {
        return PolicyResponse.builder()
                .id(p.getId())
                .depositMonths(p.getDepositMonths())
                .contractType(p.getContractType())
                .allowsResidenceReg(p.getAllowsResidenceReg())
                .checkinTime(p.getCheckinTime())
                .checkoutTime(p.getCheckoutTime())
                .allowsGuests(p.getAllowsGuests())
                .allowsPets(p.getAllowsPets())
                .allowsCooking(p.getAllowsCooking())
                .referralPolicy(p.getReferralPolicy())
                .otherRules(p.getOtherRules())
                .build();
    }

    private FacilityResponse toFacilityResponse(ListingFacility f) {
        return FacilityResponse.builder()
                .id(f.getId())
                .facilityType(f.getFacilityType())
                .name(f.getName())
                .isIncluded(f.getIsIncluded())
                .note(f.getNote())
                .build();
    }

    private ImageResponse toImageResponse(ListingImage i) {
        return ImageResponse.builder()
                .id(i.getId())
                .url(i.getUrl())
                .isCover(i.getIsCover())
                .sortOrder(i.getSortOrder())
                .createdAt(i.getCreatedAt())
                .build();
    }

    private TagDto toTagDto(Tag t) {
        return TagDto.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .build();
    }
}
