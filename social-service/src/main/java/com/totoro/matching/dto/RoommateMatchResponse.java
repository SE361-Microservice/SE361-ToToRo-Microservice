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
public class RoommateMatchResponse {
    private Long id;
    private Long userAId;
    private Long userBId;
    private LocalDateTime matchedAt;
}

