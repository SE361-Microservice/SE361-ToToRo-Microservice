package com.totoro.review.controller;

import com.totoro.review.dto.ReviewUpvoteResponse;
import com.totoro.review.service.ReviewUpvoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/reviews/{reviewId}/upvotes")
@RequiredArgsConstructor
public class ReviewUpvoteController {

    private final ReviewUpvoteService reviewUpvoteService;

    @PostMapping
    public ResponseEntity<ReviewUpvoteResponse> upvote(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewUpvoteService.upvote(userId, reviewId));
    }

    @DeleteMapping
    public ResponseEntity<ReviewUpvoteResponse> removeUpvote(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewUpvoteService.removeUpvote(userId, reviewId));
    }
}
