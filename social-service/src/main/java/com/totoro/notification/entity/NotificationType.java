package com.totoro.notification.entity;

/**
 * Enum representing all notification types in the system.
 */
public enum NotificationType {
    /** A new listing matches user's saved preferences */
    NEW_LISTING_MATCH,
    /** A new roommate match was found */
    ROOMMATE_MATCH,
    /** A new chat message was received */
    NEW_MESSAGE,
    /** A review received a reply */
    REVIEW_REPLY,
    /** A listing was rejected by admin */
    LISTING_REJECTED,
    /** System-generated alert (e.g., listing pending approval) */
    SYSTEM_ALERT,
    /** AI-generated proactive recommendation notification */
    AI_RECOMMENDATION
}



