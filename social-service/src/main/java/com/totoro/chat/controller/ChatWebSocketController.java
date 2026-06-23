package com.totoro.chat.controller;

import com.totoro.chat.dto.MessageRequest;
import com.totoro.chat.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;

    @MessageMapping("/conversations/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            MessageRequest request,
            Principal principal) {
        
        if (principal == null) {
            log.warn("Unauthorized WebSocket message attempt to conversation {}", conversationId);
            return;
        }

        messageService.sendMessageByEmail(principal.getName(), conversationId, request);
    }
}


