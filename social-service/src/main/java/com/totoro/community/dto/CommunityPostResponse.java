package com.totoro.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPostResponse {
    private Long id;
    private Long authorId;
    private String authorEmail;
    private String title;
    private String content;
    private Long listingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

