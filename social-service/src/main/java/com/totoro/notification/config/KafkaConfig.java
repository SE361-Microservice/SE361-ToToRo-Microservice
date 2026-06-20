package com.totoro.notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * Enables Kafka support when the "kafka" profile is active.
 * <p>
 * In the default profile, Kafka auto-configuration is excluded via
 * {@code spring.autoconfigure.exclude} in application.yml,
 * so no Kafka broker is needed for local development.
 */
@Configuration
@Profile("kafka")
@EnableKafka
public class KafkaConfig {
}



