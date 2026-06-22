package com.totoro.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private Long userId;
    private String userFullName;
    private String userAvatarUrl;
    private Short ratingOverall;
    private Short ratingCleanliness;
    private Short ratingSecurity;
    private Short ratingLandlord;
    private Short ratingAccuracy;
    private String content;
    private Integer upvoteCount;
    private String landlordReplyContent;
    private LocalDateTime landlordRepliedAt;
    private List<ReviewSourceResponse> sources;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
