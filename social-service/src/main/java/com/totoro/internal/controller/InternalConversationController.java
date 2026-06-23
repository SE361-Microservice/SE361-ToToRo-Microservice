package com.totoro.internal.controller;

import com.totoro.chat.dto.ConversationResponse;
import com.totoro.chat.dto.CreateConversationRequest;
import com.totoro.chat.entity.ConversationType;
import com.totoro.chat.service.ConversationService;
import com.totoro.internal.dto.InternalCreateConversationRequest;
import com.totoro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API for AI Service to create conversations on behalf of users.
 * Auth handled by InternalApiKeyFilter (X-Internal-Key header).
 * <p>
 * Called by AI Service after a roommate match is confirmed, to automatically
 * open a direct chat channel between the two matched users.
 */
@RestController
@RequestMapping("/api/internal/conversations")
@RequiredArgsConstructor
public class InternalConversationController {

    private final ConversationService conversationService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createConversation(
            @RequestBody InternalCreateConversationRequest request) {

        if (!userRepository.existsById(request.getUserId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found: " + request.getUserId()));
        }
        if (!userRepository.existsById(request.getTargetUserId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Target user not found: " + request.getTargetUserId()));
        }

        CreateConversationRequest convRequest = new CreateConversationRequest();
        convRequest.setType(ConversationType.DIRECT);
        convRequest.setMemberIds(List.of(request.getTargetUserId()));

        ConversationResponse conversation = conversationService.createConversation(request.getUserId(), convRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }
}
