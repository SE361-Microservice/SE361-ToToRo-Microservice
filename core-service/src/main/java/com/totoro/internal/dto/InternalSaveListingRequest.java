package com.totoro.internal.dto;

import lombok.Data;

@Data
public class InternalSaveListingRequest {
    private Long userId;
    private Long listingId;
}
