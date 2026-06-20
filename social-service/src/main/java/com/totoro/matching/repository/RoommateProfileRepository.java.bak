package com.totoro.matching.repository;

import com.totoro.matching.entity.RoommateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface RoommateProfileRepository extends JpaRepository<RoommateProfile, Long>,
        JpaSpecificationExecutor<RoommateProfile> {
    Optional<RoommateProfile> findByUserId(Long userId);
    
    Page<RoommateProfile> findByUserIdNotAndIsActiveTrue(Long userId, Pageable pageable);
}

