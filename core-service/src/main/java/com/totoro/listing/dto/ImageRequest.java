package com.totoro.listing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ImageRequest {

    @NotBlank
    private String url;

    private Boolean isCover = false;

    private Short sortOrder = 0;
}
