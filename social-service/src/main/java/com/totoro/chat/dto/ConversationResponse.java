package com.totoro.chat.dto;

import com.totoro.chat.entity.ConversationType;
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
public class ConversationResponse {
    private Long id;
    private ConversationType type;
    private String name;
    private Long createdById;
    private List<MemberProfileDto> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

