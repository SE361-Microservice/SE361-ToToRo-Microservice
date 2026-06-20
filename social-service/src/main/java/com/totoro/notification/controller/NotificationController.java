package com.totoro.notification.controller;

import com.totoro.listing.dto.PageResponse;import com.totoro.notification.dto.NotificationResponse;
import com.totoro.notification.dto.UnreadCountResponse;
import com.totoro.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get paginated notifications for the current user.
     * Sorted by createdAt DESC (newest first).
     */
    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getNotifications(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = String.valueOf(userId);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getNotifications(email, pageable));
    }

    /**
     * Get unread notification count for the current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@RequestHeader("X-User-Id") Long userId) {
        String email = String.valueOf(userId);
        return ResponseEntity.ok(notificationService.getUnreadCount(email));
    }

    /**
     * Mark a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        String email = String.valueOf(userId);
        notificationService.markAsRead(email, id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    /**
     * Mark all notifications as read for the current user.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@RequestHeader("X-User-Id") Long userId) {
        String email = String.valueOf(userId);
        int count = notificationService.markAllAsRead(email);
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read",
                "count", count
        ));
    }
}




