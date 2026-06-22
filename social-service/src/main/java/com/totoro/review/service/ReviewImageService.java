package com.totoro.review.service;

import com.totoro.review.dto.ReviewImageResponse;
import com.totoro.review.entity.Review;
import com.totoro.review.entity.ReviewImage;
import com.totoro.review.repository.ReviewImageRepository;
import com.totoro.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewImageService {

    private static final String UPLOAD_DIR = "uploads/review-images/";

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    @Transactional
    public ReviewImageResponse uploadImage(Long userId, Long reviewId, MultipartFile file) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));

        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền thêm ảnh cho đánh giá này");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Tệp tải lên không hợp lệ");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ cho phép tệp ảnh");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), uploadPath.resolve(newFilename));

            ReviewImage reviewImage = ReviewImage.builder()
                    .review(review)
                    .imageUrl("/uploads/review-images/" + newFilename)
                    .build();

            return toResponse(reviewImageRepository.save(reviewImage));
        } catch (IOException e) {
            throw new RuntimeException("Không thể tải ảnh lên", e);
        }
    }

    public List<ReviewImageResponse> getImages(Long reviewId) {
        return reviewImageRepository.findByReviewIdOrderByIdAsc(reviewId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteImage(Long userId, Long reviewId, Long imageId) {
        ReviewImage reviewImage = reviewImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ảnh"));

        if (!reviewImage.getReview().getId().equals(reviewId)) {
            throw new IllegalArgumentException("Ảnh không thuộc đánh giá này");
        }

        if (!reviewImage.getReview().getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa ảnh này");
        }

        try {
            Path filePath = Paths.get(reviewImage.getImageUrl().substring(1));
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }

        reviewImageRepository.delete(reviewImage);
    }

    private ReviewImageResponse toResponse(ReviewImage reviewImage) {
        return ReviewImageResponse.builder()
                .id(reviewImage.getId())
                .imageUrl(reviewImage.getImageUrl())
                .createdAt(reviewImage.getCreatedAt())
                .build();
    }
}
