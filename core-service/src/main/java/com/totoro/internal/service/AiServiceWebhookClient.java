package com.totoro.internal.service;

import com.totoro.listing.entity.Listing;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Async webhook client for notifying AI Service about new listings.
 * Called when a listing is activated (approved by admin).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceWebhookClient {

    @Value("${ai-service.base-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    private final RestTemplate restTemplate;

    /**
     * Notify AI Service about a newly activated listing.
     * Runs asynchronously to avoid blocking the listing activation flow.
     */
    @Async
    public void notifyNewListing(Listing listing) {
        try {
            String url = aiServiceBaseUrl + "/agent/notify/new-listing";

            Map<String, Object> body = new HashMap<>();
            body.put("listing_id", listing.getId());
            body.put("title", listing.getTitle());
            body.put("price", listing.getPriceRent());
            body.put("district", listing.getDistrict());
            body.put("city", listing.getCity());
            body.put("room_type", listing.getRoomType());
            if (listing.getTags() != null) {
                body.put("tags", listing.getTags().stream()
                        .map(t -> t.getSlug())
                        .collect(Collectors.toList()));
            }

            restTemplate.postForEntity(url, body, String.class);
            log.info("AI Service notified about new listing: id={}", listing.getId());
        } catch (Exception e) {
            log.warn("Failed to notify AI Service about listing {}: {}", listing.getId(), e.getMessage());
        }
    }
}
