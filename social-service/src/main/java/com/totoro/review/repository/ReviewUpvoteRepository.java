package com.totoro.review.repository;

import com.totoro.review.entity.ReviewUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewUpvoteRepository extends JpaRepository<ReviewUpvote, Long> {
    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);

    long countByReviewId(Long reviewId);

    @Modifying
    @Query("DELETE FROM ReviewUpvote u WHERE u.userId = :userId AND u.review.id = :reviewId")
    void deleteByUserIdAndReviewId(Long userId, Long reviewId);
}
