package com.totoro.review.service;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.review.dto.ReviewUpvoteResponse;
import com.totoro.review.entity.Review;
import com.totoro.review.entity.ReviewUpvote;
import com.totoro.review.repository.ReviewRepository;
import com.totoro.review.repository.ReviewUpvoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewUpvoteService {

    private final ReviewRepository reviewRepository;
    private final ReviewUpvoteRepository reviewUpvoteRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public ReviewUpvoteResponse upvote(Long userId, Long reviewId) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy user");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review"));

        if (!reviewUpvoteRepository.existsByUserIdAndReviewId(user.getId(), reviewId)) {
            ReviewUpvote upvote = ReviewUpvote.builder()
                    .userId(user.getId())
                    .review(review)
                    .build();
            reviewUpvoteRepository.save(upvote);
            review.setUpvoteCount(Math.toIntExact(reviewUpvoteRepository.countByReviewId(reviewId)));
            reviewRepository.save(review);
        }

        return ReviewUpvoteResponse.builder()
                .reviewId(reviewId)
                .upvoteCount(review.getUpvoteCount())
                .upvoted(true)
                .build();
    }

    @Transactional
    public ReviewUpvoteResponse removeUpvote(Long userId, Long reviewId) {
        UserProfileDto user = userServiceClient.getUserProfile(userId);
        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy user");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review"));

        if (reviewUpvoteRepository.existsByUserIdAndReviewId(user.getId(), reviewId)) {
            reviewUpvoteRepository.deleteByUserIdAndReviewId(user.getId(), reviewId);
            review.setUpvoteCount(Math.toIntExact(reviewUpvoteRepository.countByReviewId(reviewId)));
            reviewRepository.save(review);
        }

        return ReviewUpvoteResponse.builder()
                .reviewId(reviewId)
                .upvoteCount(review.getUpvoteCount())
                .upvoted(false)
                .build();
    }
}
