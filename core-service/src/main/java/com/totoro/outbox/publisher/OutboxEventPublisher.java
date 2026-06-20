package com.totoro.outbox.publisher;

import com.totoro.outbox.entity.OutboxEvent;
import com.totoro.outbox.entity.OutboxEventStatus;
import com.totoro.outbox.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPublisher {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void publishEvents() {
        Pageable limit = PageRequest.of(0, 100);
        List<OutboxEvent> events = outboxEventRepository.findByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING, limit);

        if (events.isEmpty()) {
            return;
        }

        log.info("Found {} pending outbox events to publish", events.size());

        for (OutboxEvent event : events) {
            try {
                // Topic name is derived from event type, e.g., LISTING_CREATED -> listing-created
                String topic = event.getEventType().toLowerCase().replace("_", "-");
                
                kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload())
                        .whenComplete((result, ex) -> {
                            if (ex == null) {
                                log.debug("Successfully sent event {} to topic {}", event.getId(), topic);
                            } else {
                                log.error("Failed to send event {} to topic {}", event.getId(), topic, ex);
                            }
                        });

                event.setStatus(OutboxEventStatus.SENT);
            } catch (Exception e) {
                log.error("Failed to process outbox event {}", event.getId(), e);
                event.setStatus(OutboxEventStatus.FAILED);
            }
        }
        
        outboxEventRepository.saveAll(events);
    }
}
