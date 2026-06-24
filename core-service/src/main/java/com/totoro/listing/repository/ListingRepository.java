package com.totoro.listing.repository;

import com.totoro.listing.entity.Listing;
import com.totoro.listing.entity.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    Page<Listing> findByLandlordId(Long landlordId, Pageable pageable);

    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);

    @Query(value = """
            SELECT *
            FROM listings l
            WHERE l.status = 'ACTIVE'
              AND l.latitude IS NOT NULL
              AND l.longitude IS NOT NULL
              AND (
                6371 * acos(
                    cos(radians(:latitude)) * cos(radians(l.latitude))
                    * cos(radians(l.longitude) - radians(:longitude))
                    + sin(radians(:latitude)) * sin(radians(l.latitude))
                )
              ) <= :radiusKm
            """, countQuery = """
            SELECT count(*)
            FROM listings l
            WHERE l.status = 'ACTIVE'
              AND l.latitude IS NOT NULL
              AND l.longitude IS NOT NULL
              AND (
                6371 * acos(
                    cos(radians(:latitude)) * cos(radians(l.latitude))
                    * cos(radians(l.longitude) - radians(:longitude))
                    + sin(radians(:latitude)) * sin(radians(l.latitude))
                )
              ) <= :radiusKm
            """, nativeQuery = true)
    Page<Listing> findByDistanceWithin(@Param("latitude") Double latitude,
                                       @Param("longitude") Double longitude,
                                       @Param("radiusKm") Double radiusKm,
                                       Pageable pageable);

    @Query("""
            SELECT l FROM Listing l
            JOIN l.tags t
            WHERE l.status = :status
              AND t.slug IN :tagSlugs
            GROUP BY l
            HAVING COUNT(DISTINCT t.slug) = :tagCount
            """)
    Page<Listing> findByTagSlugsAll(@Param("status") ListingStatus status,
                                    @Param("tagSlugs") List<String> tagSlugs,
                                    @Param("tagCount") long tagCount,
                                    Pageable pageable);

    @Query("SELECT l.status, COUNT(l) FROM Listing l GROUP BY l.status")
    List<Object[]> countListingsByStatus();

    @Modifying
    @Query("UPDATE Listing l SET l.viewCount = l.viewCount + 1 WHERE l.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
