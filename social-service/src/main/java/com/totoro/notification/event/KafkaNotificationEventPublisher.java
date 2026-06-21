package com.totoro.notification.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka-based implementation of {@link NotificationEventPublisher}.
 * Active only when the "kafka" profile is enabled.
 * <p>
 * Usage: {@code --spring.profiles.active=kafka}
 */
@Slf4j
@Component
@Profile("kafka")
@RequiredArgsConstructor
public class KafkaNotificationEventPublisher implements NotificationEventPublisher {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Override
    public void publish(NotificationEvent event) {
        log.info("[Kafka] Publishing notification event to topic '{}': type={}, userId={}",
                TOPIC, event.getType(), event.getUserId());
        kafkaTemplate.send(TOPIC, String.valueOf(event.getUserId()), event);
    }
}



