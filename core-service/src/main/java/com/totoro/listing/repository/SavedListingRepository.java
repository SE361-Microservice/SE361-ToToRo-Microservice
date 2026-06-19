package com.totoro.listing.repository;

import com.totoro.listing.entity.SavedListing;
import com.totoro.listing.entity.SavedListingId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedListingRepository extends JpaRepository<SavedListing, SavedListingId> {

    Page<SavedListing> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndListingId(Long userId, Long listingId);

    void deleteByUserIdAndListingId(Long userId, Long listingId);
}
