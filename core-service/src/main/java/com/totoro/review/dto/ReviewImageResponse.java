package com.totoro.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewImageResponse {
    private Long id;
    private String imageUrl;
    private LocalDateTime createdAt;
}
