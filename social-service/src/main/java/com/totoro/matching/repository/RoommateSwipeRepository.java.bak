package com.totoro.matching.repository;

import com.totoro.matching.entity.RoommateSwipe;
import com.totoro.matching.entity.SwipeDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoommateSwipeRepository extends JpaRepository<RoommateSwipe, Long> {
    Optional<RoommateSwipe> findBySwiperIdAndTargetUserId(Long swiperId, Long targetUserId);
    boolean existsBySwiperIdAndTargetUserIdAndDirection(Long swiperId, Long targetUserId, SwipeDirection direction);
}

