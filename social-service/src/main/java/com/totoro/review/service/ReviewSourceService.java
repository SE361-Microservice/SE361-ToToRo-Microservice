package com.totoro.review.service;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import com.totoro.review.dto.ReviewSourceResponse;
import com.totoro.review.entity.Review;
import com.totoro.review.entity.ReviewSource;
import com.totoro.review.repository.ReviewRepository;
import com.totoro.review.repository.ReviewSourceRepository;
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
public class ReviewSourceService {

    private final ReviewSourceRepository reviewSourceRepository;
    private final ReviewRepository reviewRepository;

    private static final String UPLOAD_DIR = "uploads/review-sources/";

    @Transactional
    public ReviewSourceResponse uploadSource(Long userId, Long reviewId, MultipartFile file) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review"));

        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền thêm ảnh/video vào review này");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File bị trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("image/") || contentType.startsWith("video/"))) {
            throw new IllegalArgumentException("Chỉ cho phép file ảnh (image/*) hoặc video (video/*)");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String newFilename = UUID.randomUUID() + extension;

            Files.copy(file.getInputStream(), uploadPath.resolve(newFilename));

            List<ReviewSource> existing = reviewSourceRepository.findByReviewIdOrderBySortOrderAsc(reviewId);
            short sortOrder = (short) existing.size();

            ReviewSource source = ReviewSource.builder()
                    .review(review)
                    .srcUrl("/uploads/review-sources/" + newFilename)
                    .sortOrder(sortOrder)
                    .build();

            return mapToResponse(reviewSourceRepository.save(source));
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload file", e);
        }
    }

    public List<ReviewSourceResponse> getSourcesByReview(Long reviewId) {
        return reviewSourceRepository.findByReviewIdOrderBySortOrderAsc(reviewId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSource(Long userId, Long sourceId) {
        ReviewSource source = reviewSourceRepository.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy file"));

        if (!source.getReview().getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa file này");
        }

        try {
            Path filePath = Paths.get(source.getSrcUrl().substring(1));
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }

        reviewSourceRepository.delete(source);
    }

    private ReviewSourceResponse mapToResponse(ReviewSource source) {
        return ReviewSourceResponse.builder()
                .id(source.getId())
                .srcUrl(source.getSrcUrl())
                .sortOrder(source.getSortOrder())
                .build();
    }
}
