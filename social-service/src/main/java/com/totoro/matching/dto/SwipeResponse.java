package com.totoro.matching.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwipeResponse {
    private Long swipeId;
    private Long targetUserId;
    private String direction;
    private boolean matched;
    private Long matchId;
    private LocalDateTime matchedAt;
}

