package com.totoro.community.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateCommunityPostRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private Long listingId;
}

