package com.totoro.review.controller;

import com.totoro.review.dto.ReviewSourceResponse;
import com.totoro.review.service.ReviewSourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews/{reviewId}/sources")
@RequiredArgsConstructor
public class ReviewSourceController {

    private final ReviewSourceService reviewSourceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewSourceResponse> uploadSource(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewSourceService.uploadSource(userId, reviewId, file));
    }

    @GetMapping
    public ResponseEntity<List<ReviewSourceResponse>> getSourcesByReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewSourceService.getSourcesByReview(reviewId));
    }

    @DeleteMapping("/{sourceId}")
    public ResponseEntity<String> deleteSource(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId,
            @PathVariable Long sourceId) {
        reviewSourceService.deleteSource(userId, sourceId);
        return ResponseEntity.ok("Xóa file thành công");
    }
}
