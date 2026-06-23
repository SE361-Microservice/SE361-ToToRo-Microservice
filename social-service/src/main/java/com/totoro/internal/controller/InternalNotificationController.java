package com.totoro.internal.controller;

import com.totoro.internal.dto.InternalNotificationRequest;
import com.totoro.notification.event.NotificationEvent;
import com.totoro.notification.service.NotificationService;
import com.totoro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Internal API for AI Service to create notifications.
 * Auth handled by InternalApiKeyFilter (X-Internal-Key header).
 * <p>
 * Called by AI Service when it wants to proactively notify users
 * about new listing matches or roommate recommendations.
 */
@RestController
@RequestMapping("/api/internal/notifications")
@RequiredArgsConstructor
public class InternalNotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> createNotification(
            @RequestBody InternalNotificationRequest request) {

        if (!userRepository.existsById(request.getUserId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found: " + request.getUserId()));
        }

        NotificationEvent event = NotificationEvent.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .title(request.getTitle())
                .body(request.getBody())
                .refType(request.getRefType())
                .refId(request.getRefId())
                .sendEmail(false)
                .build();

        notificationService.processEvent(event);
        return ResponseEntity.ok(Map.of("message", "Notification created successfully"));
    }
}
