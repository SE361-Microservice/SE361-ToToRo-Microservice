package com.totoro.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {
        // Prefer CLOUDINARY_URL env variable (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
        if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
            return new Cloudinary(cloudinaryUrl);
        }
        // Fallback to individual properties
        return new Cloudinary(Map.of(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
