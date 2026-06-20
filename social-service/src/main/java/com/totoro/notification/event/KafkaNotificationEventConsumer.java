package com.totoro.notification.event;

import com.totoro.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka consumer that processes notification events.
 * Active only when the "kafka" profile is enabled.
 */
@Slf4j
@Component
@Profile("kafka")
@RequiredArgsConstructor
public class KafkaNotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = NotificationEventPublisher.TOPIC,
            groupId = "totoro-notification"
    )
    public void consume(NotificationEvent event) {
        log.info("[Kafka] Consuming notification event: type={}, userId={}", event.getType(), event.getUserId());
        notificationService.processEvent(event);
    }
}



