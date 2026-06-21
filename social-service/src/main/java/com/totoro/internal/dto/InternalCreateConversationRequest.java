package com.totoro.internal.dto;

import lombok.Data;

@Data
public class InternalCreateConversationRequest {
    private Long userId;
    private Long targetUserId;
}




