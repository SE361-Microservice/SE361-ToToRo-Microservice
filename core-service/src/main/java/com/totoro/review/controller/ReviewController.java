package com.totoro.review.controller;

import com.totoro.review.dto.CreateReviewRequest;
import com.totoro.review.dto.ReviewResponse;
import com.totoro.review.dto.UpdateReviewRequest;
import com.totoro.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviewsByListing(@RequestParam Long listingId) {
        return ResponseEntity.ok(reviewService.getReviewsByListing(listingId));
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getReviewById(reviewId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(reviewService.getMyReviews(userId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(userId, reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.ok("Xóa đánh giá thành công");
    }
}
