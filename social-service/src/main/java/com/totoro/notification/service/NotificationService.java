package com.totoro.notification.service;

import com.totoro.common.dto.PageResponse;
import com.totoro.notification.dto.NotificationResponse;
import com.totoro.notification.dto.UnreadCountResponse;
import com.totoro.notification.entity.Notification;
import com.totoro.notification.entity.NotificationType;
import com.totoro.notification.event.NotificationEvent;
import com.totoro.notification.repository.NotificationRepository;
import com.totoro.user.entity.User;
import com.totoro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core notification service handling:
 * <ul>
 *   <li>Persisting notifications to DB</li>
 *   <li>Pushing realtime via WebSocket/STOMP</li>
 *   <li>Sending email notifications</li>
 *   <li>CRUD operations for notification API</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ==================== EVENT PROCESSING ====================

    /**
     * Process a notification event: save to DB, push via WebSocket, optionally send email.
     * Called by both InMemory listener and Kafka consumer.
     */
    @Transactional
    public void processEvent(NotificationEvent event) {
        try {
            User user = userRepository.findById(event.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + event.getUserId()));

            // 1. Persist to DB
            Notification notification = Notification.builder()
                    .user(user)
                    .type(NotificationType.valueOf(event.getType()))
                    .title(event.getTitle())
                    .body(event.getBody())
                    .refType(event.getRefType())
                    .refId(event.getRefId())
                    .isRead(false)
                    .build();

            notification = notificationRepository.save(notification);
            NotificationResponse response = toResponse(notification);

            // 2. Push realtime via WebSocket (to /user/{email}/queue/notifications)
            try {
                messagingTemplate.convertAndSendToUser(
                        user.getEmail(),
                        "/queue/notifications",
                        response
                );
                log.info("WebSocket push sent to user: {}", user.getEmail());
            } catch (Exception e) {
                log.warn("Failed to push WebSocket notification to user {}: {}", user.getEmail(), e.getMessage());
            }

            // 3. Send email if requested
            if (event.isSendEmail() && event.getRecipientEmail() != null) {
                try {
                    sendNotificationEmail(event);
                    log.info("Email notification sent to: {}", event.getRecipientEmail());
                } catch (Exception e) {
                    log.warn("Failed to send email notification to {}: {}", event.getRecipientEmail(), e.getMessage());
                }
            }

            log.info("Notification processed: id={}, type={}, userId={}",
                    notification.getId(), event.getType(), event.getUserId());

        } catch (Exception e) {
            log.error("Failed to process notification event: {}", event, e);
        }
    }

    // ==================== API OPERATIONS ====================

    /**
     * Get paginated notifications for the current user.
     */
    public PageResponse<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        User user = findUserById(userId);
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        List<NotificationResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    /**
     * Get unread notification count for the current user.
     */
    public UnreadCountResponse getUnreadCount(Long userId) {
        User user = findUserById(userId);
        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return UnreadCountResponse.builder().count(count).build();
    }

    /**
     * Mark a single notification as read.
     */
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        User user = findUserById(userId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for the current user.
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        User user = findUserById(userId);
        return notificationRepository.markAllAsRead(user.getId());
    }

    // ==================== HELPERS ====================

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void sendNotificationEmail(NotificationEvent event) {
        String subject = event.getTitle() + " — ToToRo";
        String htmlContent = buildEmailHtml(event);
        log.info("MOCK Email sent to {}: {}", event.getRecipientEmail(), subject);
    }

    private String buildEmailHtml(NotificationEvent event) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">" +
                "<h2 style=\"color: #4A90D9;\">🔔 " + escapeHtml(event.getTitle()) + "</h2>" +
                (event.getBody() != null ? "<p>" + escapeHtml(event.getBody()) + "</p>" : "") +
                "<hr style=\"border: 1px solid #eee;\">" +
                "<p style=\"color: #888; font-size: 12px;\">This notification was sent from ToToRo. " +
                "Please do not reply to this email.</p>" +
                "</div>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .body(notification.getBody())
                .refType(notification.getRefType())
                .refId(notification.getRefId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}



