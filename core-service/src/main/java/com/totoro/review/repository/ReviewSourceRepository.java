package com.totoro.review.repository;

import com.totoro.review.entity.ReviewSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewSourceRepository extends JpaRepository<ReviewSource, Long> {
    List<ReviewSource> findByReviewIdOrderBySortOrderAsc(Long reviewId);
}
