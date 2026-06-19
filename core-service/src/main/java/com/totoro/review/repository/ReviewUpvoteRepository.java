package com.totoro.review.repository;

import com.totoro.review.entity.ReviewUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewUpvoteRepository extends JpaRepository<ReviewUpvote, Long> {
    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);
    long countByReviewId(Long reviewId);
    void deleteByUserIdAndReviewId(Long userId, Long reviewId);
}
