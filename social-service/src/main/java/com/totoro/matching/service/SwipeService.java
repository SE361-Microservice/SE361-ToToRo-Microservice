package com.totoro.matching.service;

import com.totoro.matching.dto.RoommateMatchResponse;
import com.totoro.matching.dto.SwipeRequest;
import com.totoro.matching.dto.SwipeResponse;
import com.totoro.matching.entity.RoommateMatch;
import com.totoro.matching.entity.RoommateSwipe;
import com.totoro.matching.entity.SwipeDirection;
import com.totoro.matching.repository.RoommateMatchRepository;
import com.totoro.matching.repository.RoommateSwipeRepository;
import com.totoro.user.entity.User;
import com.totoro.user.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SwipeService {

    private final UserCacheService userCacheService;
    private final RoommateSwipeRepository roommateSwipeRepository;
    private final RoommateMatchRepository roommateMatchRepository;

    @Transactional
    public SwipeResponse swipe(Long swiperId, SwipeRequest request) {
        User swiper = userCacheService.findById(swiperId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + swiperId));
        User target = userCacheService.findById(request.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user mục tiêu: " + request.getTargetUserId()));

        if (swiper.getId().equals(target.getId())) {
            throw new IllegalArgumentException("Không thể swipe chính mình");
        }

        RoommateSwipe swipe = roommateSwipeRepository.findBySwiperIdAndTargetUserId(swiper.getId(), target.getId())
                .orElse(RoommateSwipe.builder().swiper(swiper).targetUser(target).build());
        swipe.setDirection(request.getDirection());
        RoommateSwipe savedSwipe = roommateSwipeRepository.save(swipe);

        boolean matched = false;
        Long matchId = null;
        java.time.LocalDateTime matchedAt = null;

        if (request.getDirection() == SwipeDirection.RIGHT) {
            boolean oppositeRight = roommateSwipeRepository.existsBySwiperIdAndTargetUserIdAndDirection(
                    target.getId(), swiper.getId(), SwipeDirection.RIGHT);
            if (oppositeRight) {
                matched = true;
                if (!roommateMatchRepository.existsByUserAIdAndUserBId(swiper.getId(), target.getId())
                        && !roommateMatchRepository.existsByUserAIdAndUserBId(target.getId(), swiper.getId())) {
                    RoommateMatch match = roommateMatchRepository.save(RoommateMatch.builder()
                            .userA(swiper)
                            .userB(target)
                            .build());
                    matchId = match.getId();
                    matchedAt = match.getMatchedAt();
                }
            }
        }

        return SwipeResponse.builder()
                .swipeId(savedSwipe.getId())
                .targetUserId(target.getId())
                .direction(savedSwipe.getDirection().name())
                .matched(matched)
                .matchId(matchId)
                .matchedAt(matchedAt)
                .build();
    }

    public List<RoommateMatchResponse> getMyMatches(Long userId) {
        return roommateMatchRepository.findByUserAIdOrUserBId(userId, userId)
                .stream()
                .map(match -> RoommateMatchResponse.builder()
                        .id(match.getId())
                        .userAId(match.getUserA().getId())
                        .userBId(match.getUserB().getId())
                        .matchedAt(match.getMatchedAt())
                        .build())
                .toList();
    }
}
