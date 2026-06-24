package com.totoro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from /tmp directory (writable on Cloud Run)
        String tmpDir = System.getProperty("java.io.tmpdir");
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + tmpDir + "/uploads/");
    }
}
