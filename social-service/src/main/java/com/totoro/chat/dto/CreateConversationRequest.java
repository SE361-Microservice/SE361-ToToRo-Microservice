package com.totoro.chat.dto;

import com.totoro.chat.entity.ConversationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateConversationRequest {
    @NotNull
    private ConversationType type;
    private String name;
    private List<Long> memberIds;
}

