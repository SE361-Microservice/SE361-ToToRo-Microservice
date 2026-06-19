package com.totoro.internal.dto;

import lombok.Data;

@Data
public class InternalNotificationRequest {
    private Long userId;
    private String type;
    private String title;
    private String body;
    private String refType;
    private Long refId;
}
