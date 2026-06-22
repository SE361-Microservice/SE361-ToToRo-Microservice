package com.totoro.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpvoteResponse {
    private Long reviewId;
    private Integer upvoteCount;
    private boolean upvoted;
}
