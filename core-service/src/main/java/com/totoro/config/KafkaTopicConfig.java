package com.totoro.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic listingCreatedTopic() {
        return TopicBuilder.name("listing-created")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic reviewCreatedTopic() {
        return TopicBuilder.name("review-created")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
