package com.totoro.listing.service;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.common.enums.Role;
import com.totoro.internal.service.AiServiceWebhookClient;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.listing.dto.*;
import com.totoro.listing.entity.*;
import com.totoro.listing.repository.ListingRepository;
import com.totoro.listing.repository.TagRepository;
import com.totoro.outbox.entity.OutboxEvent;
import com.totoro.outbox.entity.OutboxEventStatus;
import com.totoro.outbox.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * CQRS — Command Side.
 * Handles all state-changing operations: create, update, delete, activate, reject.
 * Each write operation publishes an outbox event so social-service can stay in sync.
 *
 * @see ListingQueryService for the read side.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ListingCommandService {

    private final ListingRepository listingRepository;
    private final TagRepository tagRepository;
    private final UserServiceClient userServiceClient;
    private final AiServiceWebhookClient aiServiceWebhookClient;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    // ==================== CREATE ====================

    @Transactional
    @CacheEvict(value = "listing-search", allEntries = true)
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

        if (request.getPolicy() != null) {
            listing.setPolicy(mapPolicyFromRequest(request.getPolicy()));
        }

        if (request.getFacilities() != null) {
            for (FacilityRequest fr : request.getFacilities()) {
                listing.addFacility(ListingFacility.builder()
                        .facilityType(fr.getFacilityType()).name(fr.getName())
                        .isIncluded(fr.getIsIncluded() != null ? fr.getIsIncluded() : true)
                        .note(fr.getNote()).build());
            }
        }

        if (request.getImages() != null) {
            for (ImageRequest ir : request.getImages()) {
                listing.addImage(ListingImage.builder()
                        .url(ir.getUrl())
                        .isCover(ir.getIsCover() != null ? ir.getIsCover() : false)
                        .sortOrder(ir.getSortOrder() != null ? ir.getSortOrder() : 0).build());
            }
        }

        if (request.getTagSlugs() != null && !request.getTagSlugs().isEmpty()) {
            listing.setTags(new HashSet<>(tagRepository.findBySlugIn(request.getTagSlugs())));
        }

        listing = listingRepository.save(listing);
        publishOutboxEvent("LISTING_CREATED", listing.getId(), buildCreatedPayload(listing));
        return toDetailResponse(listing);
    }

    // ==================== UPDATE ====================

    @Transactional
    @CacheEvict(value = "listing-search", allEntries = true)
    public ListingDetailResponse updateListing(Long userId, Long id, UpdateListingRequest request) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Listing listing = findById(id);
        checkOwnership(user, listing);

        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getDescription() != null) listing.setDescription(request.getDescription());
        if (request.getAddress() != null) listing.setAddress(request.getAddress());
        if (request.getDistrict() != null) listing.setDistrict(request.getDistrict());
        if (request.getCity() != null) listing.setCity(request.getCity());
        if (request.getLatitude() != null) listing.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) listing.setLongitude(request.getLongitude());
        if (request.getRoomType() != null) listing.setRoomType(request.getRoomType());
        if (request.getAreaM2() != null) listing.setAreaM2(request.getAreaM2());
        if (request.getPriceRent() != null) listing.setPriceRent(request.getPriceRent());
        if (request.getPriceElectricity() != null) listing.setPriceElectricity(request.getPriceElectricity());
        if (request.getPriceWater() != null) listing.setPriceWater(request.getPriceWater());
        if (request.getPriceManagement() != null) listing.setPriceManagement(request.getPriceManagement());
        if (request.getPriceParking() != null) listing.setPriceParking(request.getPriceParking());
        if (request.getIsSharedOwner() != null) listing.setIsSharedOwner(request.getIsSharedOwner());
        if (request.getMaxOccupants() != null) listing.setMaxOccupants(request.getMaxOccupants());
        if (request.getAvailableFrom() != null) listing.setAvailableFrom(request.getAvailableFrom());

        if (request.getPolicy() != null) {
            ListingPolicy policy = listing.getPolicy();
            if (policy == null) listing.setPolicy(mapPolicyFromRequest(request.getPolicy()));
            else updatePolicyFromRequest(policy, request.getPolicy());
        }

        if (request.getFacilities() != null) {
            listing.getFacilities().clear();
            for (FacilityRequest fr : request.getFacilities()) {
                listing.addFacility(ListingFacility.builder()
                        .facilityType(fr.getFacilityType()).name(fr.getName())
                        .isIncluded(fr.getIsIncluded() != null ? fr.getIsIncluded() : true)
                        .note(fr.getNote()).build());
            }
        }

        if (request.getImages() != null) {
            listing.getImages().clear();
            for (ImageRequest ir : request.getImages()) {
                listing.addImage(ListingImage.builder()
                        .url(ir.getUrl())
                        .isCover(ir.getIsCover() != null ? ir.getIsCover() : false)
                        .sortOrder(ir.getSortOrder() != null ? ir.getSortOrder() : 0).build());
            }
        }

        if (request.getTagSlugs() != null) {
            listing.setTags(new HashSet<>(tagRepository.findBySlugIn(request.getTagSlugs())));
        }

        listing.setStatus(ListingStatus.PENDING);
        listing = listingRepository.save(listing);

        // Publish LISTING_UPDATED so social-service can sync listing_cache (CQRS read model)
        publishOutboxEvent("LISTING_UPDATED", listing.getId(), buildUpdatedPayload(listing));

        return toDetailResponse(listing);
    }

    // ==================== DELETE ====================

    @Transactional
    @CacheEvict(value = "listing-search", allEntries = true)
    public void deleteListing(Long userId, Long id) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        Listing listing = findById(id);

        if (user.getRole() != Role.ADMIN) checkOwnership(user, listing);

        listing.setStatus(ListingStatus.INACTIVE);
        listingRepository.save(listing);

        // Publish LISTING_DELETED so social-service can purge listing_cache (cascade → reviews)
        publishOutboxEvent("LISTING_DELETED", listing.getId(), Map.of("listingId", listing.getId()));
    }

    // ==================== ADMIN COMMANDS ====================

    @Transactional
    @CacheEvict(value = "listing-search", allEntries = true)
    public ListingDetailResponse activateListing(Long id) {
        Listing listing = findById(id);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);

        // Publish LISTING_CREATED event for social-service so listing enters the cache
        publishOutboxEvent("LISTING_CREATED", listing.getId(), buildCreatedPayload(listing));

        // Notify AI Service about new active listing (async, non-blocking)
        aiServiceWebhookClient.notifyNewListing(listing);
        return toDetailResponse(listing);
    }

    @Transactional
    @CacheEvict(value = "listing-search", allEntries = true)
    public ListingDetailResponse rejectListing(Long id) {
        Listing listing = findById(id);
        listing.setStatus(ListingStatus.REJECTED);
        listingRepository.save(listing);
        return toDetailResponse(listing);
    }

    // ==================== SHARED HELPERS (package-private for QueryService) ====================

    Listing findById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
    }

    @Transactional
    public void incrementViewCount(Long id) {
        listingRepository.incrementViewCount(id);
    }

    void checkOwnership(UserProfileDto user, Listing listing) {
        if (!listing.getLandlordId().equals(user.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this listing");
        }
    }

    ListingDetailResponse toDetailResponse(Listing listing) {
        String landlordName = "";
        String landlordPhone = "";
        try {
            UserProfileDto profile = userServiceClient.getUserProfile(listing.getLandlordId());
            if (profile != null) {
                landlordName = profile.getFullName();
                landlordPhone = profile.getPhone();
            }
        } catch (Exception ignored) {}

        return ListingDetailResponse.builder()
                .id(listing.getId())
                .landlordId(listing.getLandlordId())
                .landlordName(landlordName)
                .landlordPhone(landlordPhone)
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
                .viewCount(listing.getViewCount())
                .isSharedOwner(listing.getIsSharedOwner())
                .maxOccupants(listing.getMaxOccupants())
                .availableFrom(listing.getAvailableFrom())
                .policy(listing.getPolicy() != null ? toPolicyResponse(listing.getPolicy()) : null)
                .facilities(listing.getFacilities() != null
                        ? listing.getFacilities().stream().map(this::toFacilityResponse).toList()
                        : List.of())
                .images(listing.getImages() != null
                        ? listing.getImages().stream().map(this::toImageResponse).toList()
                        : List.of())
                .tags(listing.getTags() != null
                        ? listing.getTags().stream().map(this::toTagDto).toList()
                        : List.of())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    // ==================== PRIVATE HELPERS ====================

    private void publishOutboxEvent(String eventType, Long listingId, Map<String, Object> payload) {
        try {
            OutboxEvent event = OutboxEvent.builder()
                    .aggregateType("LISTING")
                    .aggregateId(String.valueOf(listingId))
                    .eventType(eventType)
                    .payload(objectMapper.writeValueAsString(payload))
                    .status(OutboxEventStatus.PENDING)
                    .build();
            outboxEventRepository.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save outbox event [" + eventType + "]", e);
        }
    }

    private Map<String, Object> buildCreatedPayload(Listing l) {
        return Map.of("listingId", l.getId(), "landlordId", l.getLandlordId(),
                "title", l.getTitle(), "address", l.getAddress(), "status", l.getStatus().name());
    }

    private Map<String, Object> buildUpdatedPayload(Listing l) {
        return Map.of("listingId", l.getId(), "title", l.getTitle(), "address", l.getAddress());
    }

    private ListingPolicy mapPolicyFromRequest(PolicyRequest req) {
        return ListingPolicy.builder()
                .depositMonths(req.getDepositMonths()).contractType(req.getContractType())
                .allowsResidenceReg(req.getAllowsResidenceReg() != null ? req.getAllowsResidenceReg() : false)
                .checkinTime(req.getCheckinTime()).checkoutTime(req.getCheckoutTime())
                .allowsGuests(req.getAllowsGuests() != null ? req.getAllowsGuests() : true)
                .allowsPets(req.getAllowsPets() != null ? req.getAllowsPets() : false)
                .allowsCooking(req.getAllowsCooking() != null ? req.getAllowsCooking() : true)
                .referralPolicy(req.getReferralPolicy()).otherRules(req.getOtherRules()).build();
    }

    private void updatePolicyFromRequest(ListingPolicy policy, PolicyRequest req) {
        if (req.getDepositMonths() != null) policy.setDepositMonths(req.getDepositMonths());
        if (req.getContractType() != null) policy.setContractType(req.getContractType());
        if (req.getAllowsResidenceReg() != null) policy.setAllowsResidenceReg(req.getAllowsResidenceReg());
        if (req.getCheckinTime() != null) policy.setCheckinTime(req.getCheckinTime());
        if (req.getCheckoutTime() != null) policy.setCheckoutTime(req.getCheckoutTime());
        if (req.getAllowsGuests() != null) policy.setAllowsGuests(req.getAllowsGuests());
        if (req.getAllowsPets() != null) policy.setAllowsPets(req.getAllowsPets());
        if (req.getAllowsCooking() != null) policy.setAllowsCooking(req.getAllowsCooking());
        if (req.getReferralPolicy() != null) policy.setReferralPolicy(req.getReferralPolicy());
        if (req.getOtherRules() != null) policy.setOtherRules(req.getOtherRules());
    }

    private PolicyResponse toPolicyResponse(ListingPolicy p) {
        return PolicyResponse.builder().id(p.getId()).depositMonths(p.getDepositMonths())
                .contractType(p.getContractType()).allowsResidenceReg(p.getAllowsResidenceReg())
                .checkinTime(p.getCheckinTime()).checkoutTime(p.getCheckoutTime())
                .allowsGuests(p.getAllowsGuests()).allowsPets(p.getAllowsPets())
                .allowsCooking(p.getAllowsCooking()).referralPolicy(p.getReferralPolicy())
                .otherRules(p.getOtherRules()).build();
    }

    private FacilityResponse toFacilityResponse(ListingFacility f) {
        return FacilityResponse.builder().id(f.getId()).facilityType(f.getFacilityType())
                .name(f.getName()).isIncluded(f.getIsIncluded()).note(f.getNote()).build();
    }

    private ImageResponse toImageResponse(ListingImage i) {
        return ImageResponse.builder().id(i.getId()).url(i.getUrl())
                .isCover(i.getIsCover()).sortOrder(i.getSortOrder())
                .createdAt(i.getCreatedAt()).build();
    }

    private TagDto toTagDto(Tag t) {
        return TagDto.builder().id(t.getId()).name(t.getName()).slug(t.getSlug()).build();
    }
}
