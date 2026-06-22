package com.totoro.review.service;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.listing.entity.Listing;
import com.totoro.listing.repository.ListingRepository;
import com.totoro.review.dto.*;
import com.totoro.review.entity.Review;
import com.totoro.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserServiceClient userServiceClient;
    private final ListingRepository listingRepository;

    @Transactional
    public ReviewResponse createReview(Long userId, CreateReviewRequest request) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy user");
        }

        // Look up listing from the local listing_cache
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy phòng trọ (id=" + request.getListingId() + ") trong cache. " +
                        "Phòng có thể chưa được đồng bộ từ core-service qua Kafka."));

        if (reviewRepository.existsByUserIdAndListingId(user.getId(), listing.getId())) {
            throw new IllegalArgumentException("Bạn đã review phòng này rồi");
        }

        Review review = Review.builder()
                .userId(user.getId())
                .listing(listing)
                .ratingOverall(request.getRatingOverall())
                .ratingCleanliness(request.getRatingCleanliness())
                .ratingSecurity(request.getRatingSecurity())
                .ratingLandlord(request.getRatingLandlord())
                .ratingAccuracy(request.getRatingAccuracy())
                .content(request.getContent())
                .build();

        return mapToResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getReviewsByListing(Long listingId) {
        return reviewRepository.findByListingId(listingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review"));
        return mapToResponse(review);
    }

    public List<ReviewResponse> getMyReviews(Long userId) {
        return reviewRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse updateReview(Long userId, Long reviewId, UpdateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review"));

        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền sửa review này");
        }

        review.setRatingOverall(request.getRatingOverall());
        review.setRatingCleanliness(request.getRatingCleanliness());
        review.setRatingSecurity(request.getRatingSecurity());
        review.setRatingLandlord(request.getRatingLandlord());
        review.setRatingAccuracy(request.getRatingAccuracy());
        review.setContent(request.getContent());

        return mapToResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review"));

        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa review này");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review review) {
        UserProfileDto profile = null;
        try {
            profile = userServiceClient.getUserProfile(review.getUserId());
        } catch (Exception ignored) {
        }

        List<ReviewSourceResponse> sourceDtos = review.getSources().stream()
                .map(src -> ReviewSourceResponse.builder()
                        .id(src.getId())
                        .srcUrl(src.getSrcUrl())
                        .sortOrder(src.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return ReviewResponse.builder()
                .id(review.getId())
                .listingId(review.getListing().getId())
                .listingTitle(review.getListing().getTitle())
                .userId(review.getUserId())
                .userFullName(profile != null ? profile.getFullName() : "Unknown")
                .userAvatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .ratingOverall(review.getRatingOverall())
                .ratingCleanliness(review.getRatingCleanliness())
                .ratingSecurity(review.getRatingSecurity())
                .ratingLandlord(review.getRatingLandlord())
                .ratingAccuracy(review.getRatingAccuracy())
                .content(review.getContent())
                .upvoteCount(review.getUpvoteCount())
                .landlordReplyContent(review.getLandlordReplyContent())
                .landlordRepliedAt(review.getLandlordRepliedAt())
                .sources(sourceDtos)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
