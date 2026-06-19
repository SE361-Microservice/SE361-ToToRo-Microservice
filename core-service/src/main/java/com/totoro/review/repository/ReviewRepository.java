package com.totoro.review.repository;

import com.totoro.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByListingId(Long listingId);

    List<Review> findByUserId(Long userId);

    boolean existsByUserIdAndListingId(Long userId, Long listingId);

    @Query("SELECT r.listing.id, AVG(r.ratingOverall), COUNT(r) FROM Review r WHERE r.listing.id IN :listingIds GROUP BY r.listing.id")
    List<Object[]> findAvgRatingAndCountByListingIds(@Param("listingIds") List<Long> listingIds);
}
