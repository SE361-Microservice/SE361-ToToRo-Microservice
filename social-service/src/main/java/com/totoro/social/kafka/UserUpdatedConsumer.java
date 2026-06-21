package com.totoro.social.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.totoro.social.idempotency.ProcessedEvent;
import com.totoro.social.idempotency.ProcessedEventRepository;
import com.totoro.user.entity.User;
import com.totoro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserUpdatedConsumer {

    private final ProcessedEventRepository processedEventRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "user-updated", groupId = "social-service-group")
    @Transactional
    public void consume(@Payload String message) {
        log.info("Received user-updated event: {}", message);

        try {
            JsonNode payload = objectMapper.readTree(message);
            Long userId = payload.get("userId").asLong();
            String email = payload.get("email").asText();
            String fullName = payload.get("fullName").asText();
            String avatarUrl = payload.has("avatarUrl") && !payload.get("avatarUrl").isNull() ? payload.get("avatarUrl").asText() : null;
            
            // Assuming identity-service sends an event UUID in the payload
            String eventId = payload.has("eventId") ? payload.get("eventId").asText() : "USER_UPDATED:" + userId + ":" + System.currentTimeMillis();

            if (processedEventRepository.existsById(eventId)) {
                log.info("Event {} already processed. Skipping.", eventId);
                return;
            }

            // Upsert User cache
            User user = userRepository.findById(userId).orElse(new User());
            user.setId(userId);
            user.setEmail(email);
            user.setFullName(fullName);
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            processedEventRepository.save(new ProcessedEvent(eventId, java.time.LocalDateTime.now()));
            log.info("Successfully updated User Cache for userId {}", userId);

        } catch (Exception e) {
            log.error("Error processing user-updated event: {}", message, e);
            throw new RuntimeException("Failed to process Kafka message", e);
        }
    }
}
