package com.totoro.notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables async method execution for the notification module.
 * Used by {@link com.totoro.notification.event.InMemoryNotificationEventPublisher}
 * to process events asynchronously in the default (non-Kafka) profile.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}



