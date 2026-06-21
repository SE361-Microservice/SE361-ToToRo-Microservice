package com.totoro.notification.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Event payload for notification triggers.
 * Published by other modules (Listing, Match, Message, Review)
 * and consumed by the Notification module.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {

    /** NotificationType enum name */
    private String type;

    /** Recipient user ID */
    private Long userId;

    /** Notification title */
    private String title;

    /** Notification body (optional) */
    private String body;

    /** Reference entity type: "listing", "match", "message", "review" */
    private String refType;

    /** Reference entity ID */
    private Long refId;

    /** Whether to also send an email notification */
    private boolean sendEmail;

    /** Recipient email address (required if sendEmail=true) */
    private String recipientEmail;
}



