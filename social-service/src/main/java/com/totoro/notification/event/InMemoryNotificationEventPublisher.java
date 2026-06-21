package com.totoro.notification.event;

import com.totoro.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Default (non-Kafka) implementation.
 * Uses Spring's in-process ApplicationEventPublisher for local development.
 * <p>
 * Activate the "kafka" profile to switch to real Kafka messaging.
 */
@Slf4j
@Component
@Profile("!kafka")
@RequiredArgsConstructor
public class InMemoryNotificationEventPublisher implements NotificationEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publish(NotificationEvent event) {
        log.info("[InMemory] Publishing notification event: type={}, userId={}", event.getType(), event.getUserId());
        applicationEventPublisher.publishEvent(event);
    }

    /**
     * Listener that handles the event in the same JVM.
     * Delegates to NotificationService for persistence + push.
     */
    @Component
    @Profile("!kafka")
    @RequiredArgsConstructor
    static class InMemoryNotificationEventListener {

        private final NotificationService notificationService;

        @Async
        @EventListener
        public void handleNotificationEvent(NotificationEvent event) {
            log.info("[InMemory] Consuming notification event: type={}, userId={}", event.getType(), event.getUserId());
            notificationService.processEvent(event);
        }
    }
}



