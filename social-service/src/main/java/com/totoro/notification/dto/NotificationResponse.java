package com.totoro.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String body;
    private String refType;
    private Long refId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}



