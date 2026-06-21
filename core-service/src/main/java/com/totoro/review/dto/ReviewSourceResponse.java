package com.totoro.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSourceResponse {
    private Long id;
    private String srcUrl;
    private Short sortOrder;
}
