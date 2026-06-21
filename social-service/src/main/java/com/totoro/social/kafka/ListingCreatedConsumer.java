package com.totoro.social.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.totoro.notification.event.NotificationEvent;
import com.totoro.notification.service.NotificationService;
import com.totoro.social.idempotency.ProcessedEvent;
import com.totoro.social.idempotency.ProcessedEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ListingCreatedConsumer {

    private final ProcessedEventRepository processedEventRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "listing-created", groupId = "social-service-group")
    @Transactional
    public void consume(@Payload String message) {
        log.info("Received listing-created event: {}", message);

        try {
            JsonNode payload = objectMapper.readTree(message);
            Long listingId = payload.get("listingId").asLong();
            Long landlordId = payload.get("landlordId").asLong();
            
            // Construct a unique event ID for idempotency
            String eventId = "LISTING_CREATED:" + listingId;

            // Check if already processed
            if (processedEventRepository.existsById(eventId)) {
                log.info("Event {} already processed. Skipping.", eventId);
                return;
            }

            // Create notification for the landlord to acknowledge creation
            NotificationEvent notificationEvent = new NotificationEvent(
                    "SYSTEM_ALERT",
                    landlordId,
                    "New Listing Created",
                    "Your listing #" + listingId + " has been created and is pending admin approval.",
                    "LISTING",
                    listingId,
                    false,
                    null
            );

            notificationService.processEvent(notificationEvent);

            // Mark as processed
            processedEventRepository.save(new ProcessedEvent(eventId, java.time.LocalDateTime.now()));
            log.info("Successfully processed event {}", eventId);

        } catch (Exception e) {
            log.error("Error processing listing-created event: {}", message, e);
            // Re-throw to allow Kafka to retry
            throw new RuntimeException("Failed to process Kafka message", e);
        }
    }
}
