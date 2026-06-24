package com.totoro.listing.service;

import com.totoro.listing.dto.*;
import com.totoro.listing.entity.Listing;
import com.totoro.listing.entity.ListingStatus;
import com.totoro.listing.repository.ListingRepository;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingSearchService {

    private final ListingRepository listingRepository;
    private final ListingService listingService;

    /**
     * Search listings with basic + advanced filters.
     * If lat/lng/radiusKm are provided, uses native Haversine query.
     * Otherwise, uses JPA Specification for dynamic filtering.
     */
    @Cacheable(
            value = "listing-search",
            key = "#request.city + ':' + #request.district + ':' + #request.minPrice + ':' + #request.maxPrice + ':' + #request.roomType + ':' + #request.page + ':' + #request.size + ':' + #request.sortBy + ':' + #request.sortDir",
            condition = "#request.latitude == null"
    )
    public PageResponse<ListingSummaryResponse> search(ListingSearchRequest request) {
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 20;

        // --- Distance-based search (Haversine) ---
        if (request.getLatitude() != null && request.getLongitude() != null && request.getRadiusKm() != null) {
            return searchByDistance(request, page, size);
        }

        // --- Tag-based search (requires GROUP BY + HAVING) ---
        if (request.getTagSlugs() != null && !request.getTagSlugs().isEmpty()) {
            return searchByTags(request, page, size);
        }

        // --- Standard filter search (JPA Specification) ---
        return searchBySpecification(request, page, size);
    }

    // ==================== Distance Search (Haversine) ====================

    private PageResponse<ListingSummaryResponse> searchByDistance(ListingSearchRequest request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Listing> result = listingRepository.findByDistanceWithin(
                request.getLatitude(),
                request.getLongitude(),
                request.getRadiusKm(),
                pageable);

        // Post-filter for price/district/city/roomType
        List<ListingSummaryResponse> filtered = result.getContent().stream()
                .filter(l -> matchesBasicFilters(l, request))
                .map(l -> {
                    ListingSummaryResponse summary = listingService.toSummaryResponse(l);
                    // Calculate distance for response
                    if (l.getLatitude() != null && l.getLongitude() != null) {
                        summary.setDistanceKm(haversineDistance(
                                request.getLatitude(), request.getLongitude(),
                                l.getLatitude().doubleValue(), l.getLongitude().doubleValue()));
                    }
                    return summary;
                })
                .toList();

        return PageResponse.<ListingSummaryResponse>builder()
                .content(filtered)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    // ==================== Tag Search ====================

    private PageResponse<ListingSummaryResponse> searchByTags(ListingSearchRequest request, int page, int size) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortDir()) ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Listing> result = listingRepository.findByTagSlugsAll(
                ListingStatus.ACTIVE,
                request.getTagSlugs(),
                request.getTagSlugs().size(),
                pageable);

        // Post-filter for price/district/city/roomType
        List<ListingSummaryResponse> filtered = result.getContent().stream()
                .filter(l -> matchesBasicFilters(l, request))
                .map(listingService::toSummaryResponse)
                .toList();

        return PageResponse.<ListingSummaryResponse>builder()
                .content(filtered)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    // ==================== Specification Search ====================

    private PageResponse<ListingSummaryResponse> searchBySpecification(ListingSearchRequest request, int page,
            int size) {
        String sortBy = request.getSortBy() != null ? request.getSortBy() : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortDir()) ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Specification<Listing> spec = buildSpecification(request);
        Page<Listing> result = listingRepository.findAll(spec, pageable);

        return listingService.toPageResponse(result);
    }

    // ==================== Specification Builder ====================

    private Specification<Listing> buildSpecification(ListingSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only ACTIVE listings
            predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

            // Price range
            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("priceRent"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("priceRent"), request.getMaxPrice()));
            }

            // Area range
            if (request.getMinArea() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("areaM2"), request.getMinArea()));
            }
            if (request.getMaxArea() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("areaM2"), request.getMaxArea()));
            }

            // District
            if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("district")),
                        "%" + request.getDistrict().toLowerCase() + "%"));
            }

            // City
            if (request.getCity() != null && !request.getCity().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")),
                        "%" + request.getCity().toLowerCase() + "%"));
            }

            // Room type
            if (request.getRoomType() != null && !request.getRoomType().isBlank()) {
                predicates.add(cb.equal(root.get("roomType"), request.getRoomType()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // ==================== Helpers ====================

    private boolean matchesBasicFilters(Listing listing, ListingSearchRequest request) {
        if (request.getMinPrice() != null && listing.getPriceRent() < request.getMinPrice())
            return false;
        if (request.getMaxPrice() != null && listing.getPriceRent() > request.getMaxPrice())
            return false;
        if (request.getMinArea() != null && (listing.getAreaM2() == null || listing.getAreaM2().doubleValue() < request.getMinArea()))
            return false;
        if (request.getMaxArea() != null && (listing.getAreaM2() == null || listing.getAreaM2().doubleValue() > request.getMaxArea()))
            return false;
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            String district = listing.getDistrict();
            if (district == null || !district.toLowerCase().contains(request.getDistrict().toLowerCase()))
                return false;
        }
        if (request.getCity() != null && !request.getCity().isBlank()) {
            String city = listing.getCity();
            if (city == null || !city.toLowerCase().contains(request.getCity().toLowerCase()))
                return false;
        }
        if (request.getRoomType() != null && !request.getRoomType().isBlank()
                && !request.getRoomType().equals(listing.getRoomType()))
            return false;
        return true;
    }

    /**
     * Haversine formula to calculate distance between two points on Earth (in km).
     */
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100.0) / 100.0; // Round to 2 decimal places
    }
}
