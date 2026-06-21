package com.totoro.matching.repository;

import com.totoro.matching.entity.RoommateMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoommateMatchRepository extends JpaRepository<RoommateMatch, Long> {
    boolean existsByUserAIdAndUserBId(Long userAId, Long userBId);
    List<RoommateMatch> findByUserAIdOrUserBId(Long userAId, Long userBId);
}

