package com.totoro.social.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.totoro.listing.entity.Listing;
import com.totoro.listing.repository.ListingRepository;
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

/**
 * Consumes Kafka events from core-service related to Listing lifecycle.
 *
 * Event-driven approach (Option B) for keeping listing_cache in sync:
 *  - listing-created  → upsert listing_cache + send landlord notification
 *  - listing-updated  → update listing_cache (title, address) if exists
 *  - listing-deleted  → delete from listing_cache (cascades to reviews)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ListingCreatedConsumer {

    private final ProcessedEventRepository processedEventRepository;
    private final NotificationService notificationService;
    private final ListingRepository listingRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "listing-created", groupId = "social-service-group")
    @Transactional
    public void onListingCreated(@Payload String message) {
        log.info("Received listing-created event: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            Long listingId  = payload.get("listingId").asLong();
            Long landlordId = payload.get("landlordId").asLong();
            String title    = payload.has("title")   ? payload.get("title").asText()   : "Phòng trọ #" + listingId;
            String address  = payload.has("address") ? payload.get("address").asText() : null;

            String eventId = "LISTING_CREATED:" + listingId;
            if (processedEventRepository.existsById(eventId)) {
                log.info("Event {} already processed. Skipping.", eventId);
                return;
            }

            // ── Upsert listing_cache ─────────────────────────────────────
            Listing cached = listingRepository.findById(listingId)
                    .orElse(Listing.builder().id(listingId).build());
            cached.setTitle(title);
            cached.setAddress(address);
            listingRepository.save(cached);
            log.info("listing_cache upserted for listingId={}", listingId);

            // ── Notify landlord ──────────────────────────────────────────
            NotificationEvent notificationEvent = new NotificationEvent(
                    "SYSTEM_ALERT",
                    landlordId,
                    "Tin đăng mới được tạo",
                    "Tin đăng #" + listingId + " đã được tạo và đang chờ quản trị viên phê duyệt.",
                    "LISTING",
                    listingId,
                    false,
                    null
            );
            notificationService.processEvent(notificationEvent);

            processedEventRepository.save(new ProcessedEvent(eventId, java.time.LocalDateTime.now()));
            log.info("Successfully processed event {}", eventId);

        } catch (Exception e) {
            log.error("Error processing listing-created event: {}", message, e);
            throw new RuntimeException("Failed to process Kafka message", e);
        }
    }

    @KafkaListener(topics = "listing-updated", groupId = "social-service-group")
    @Transactional
    public void onListingUpdated(@Payload String message) {
        log.info("Received listing-updated event: {}", message);
        try {
            JsonNode payload   = objectMapper.readTree(message);
            Long listingId     = payload.get("listingId").asLong();
            String newTitle    = payload.has("title")   ? payload.get("title").asText()   : null;
            String newAddress  = payload.has("address") ? payload.get("address").asText() : null;

            listingRepository.findById(listingId).ifPresent(cached -> {
                if (newTitle   != null) cached.setTitle(newTitle);
                if (newAddress != null) cached.setAddress(newAddress);
                listingRepository.save(cached);
                log.info("listing_cache updated for listingId={}", listingId);
            });

        } catch (Exception e) {
            log.error("Error processing listing-updated event: {}", message, e);
            throw new RuntimeException("Failed to process Kafka message", e);
        }
    }

    @KafkaListener(topics = "listing-deleted", groupId = "social-service-group")
    @Transactional
    public void onListingDeleted(@Payload String message) {
        log.info("Received listing-deleted event: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            Long listingId   = payload.get("listingId").asLong();

            if (listingRepository.existsById(listingId)) {
                listingRepository.deleteById(listingId);
                log.info("listing_cache deleted for listingId={} (cascades to reviews)", listingId);
            }

        } catch (Exception e) {
            log.error("Error processing listing-deleted event: {}", message, e);
            throw new RuntimeException("Failed to process Kafka message", e);
        }
    }
}
