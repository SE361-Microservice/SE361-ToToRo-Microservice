package com.totoro.identity.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Publishes domain events from identity-service to the message broker (Redpanda).
 * Consumers (e.g. social-service UserUpdatedConsumer) use these events to sync
 * the local user_cache without calling identity-service synchronously.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventPublisher {

    private static final String TOPIC_USER_UPDATED = "user-updated";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publishes a user-updated event after a profile change.
     *
     * @param userId    the ID of the updated user
     * @param email     current email
     * @param fullName  current full name (from UserProfile)
     * @param avatarUrl current avatar URL (nullable)
     */
    public void publishUserUpdated(Long userId, String email, String fullName, String avatarUrl) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventId", UUID.randomUUID().toString());  // idempotency key for consumer
        payload.put("userId", userId);
        payload.put("email", email);
        payload.put("fullName", fullName);
        payload.put("avatarUrl", avatarUrl);

        kafkaTemplate.send(TOPIC_USER_UPDATED, String.valueOf(userId), payload);
        log.info("[UserEventPublisher] Published user-updated event for userId={}", userId);
    }
}
