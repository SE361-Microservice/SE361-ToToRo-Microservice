package com.totoro.review.controller;

import com.totoro.review.dto.ReviewImageResponse;
import com.totoro.review.service.ReviewImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews/{reviewId}/images")
@RequiredArgsConstructor
public class ReviewImageController {
    private final ReviewImageService reviewImageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewImageResponse> uploadImage(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewImageService.uploadImage(userId, reviewId, file));
    }

    @GetMapping
    public ResponseEntity<List<ReviewImageResponse>> getImages(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewImageService.getImages(reviewId));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<String> deleteImage(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reviewId,
            @PathVariable Long imageId) {
        reviewImageService.deleteImage(userId, reviewId, imageId);
        return ResponseEntity.ok("Xóa ảnh thành công");
    }
}
