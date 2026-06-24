package com.totoro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC config.
 * Static resource handlers for local upload serving are no longer needed
 * since images are now served via Cloudinary CDN.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
}
