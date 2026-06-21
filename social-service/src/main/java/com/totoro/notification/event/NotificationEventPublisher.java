package com.totoro.notification.event;

/**
 * Abstraction for publishing notification events.
 * <p>
 * Two implementations exist:
 * <ul>
 *   <li>{@code InMemoryNotificationEventPublisher} — default profile, uses Spring ApplicationEventPublisher</li>
 *   <li>{@code KafkaNotificationEventPublisher} — "kafka" profile, uses Kafka topic</li>
 * </ul>
 */
public interface NotificationEventPublisher {

    String TOPIC = "notification-events";

    /**
     * Publish a notification event to be consumed by the notification service.
     *
     * @param event the notification event
     */
    void publish(NotificationEvent event);
}



