package com.totoro.internal.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that validates requests to /api/internal/** endpoints
 * using a static API key passed via the X-Internal-Key header.
 *
 * <p><b>How to generate the key:</b>
 * <pre>openssl rand -hex 32</pre>
 * Then set it as an environment variable: {@code INTERNAL_API_KEY=your_generated_key}
 * Both this service and the AI Service must share the same key value.</p>
 */
@Slf4j
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    private static final String INTERNAL_KEY_HEADER = "X-Internal-Key";

    @Value("${app.internal-api-key:}")
    private String internalApiKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/internal/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (internalApiKey == null || internalApiKey.isBlank()) {
            log.warn("Internal API key not configured. Rejecting request to {}", request.getRequestURI());
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Internal API key not configured");
            return;
        }

        String providedKey = request.getHeader(INTERNAL_KEY_HEADER);
        if (providedKey == null || !providedKey.equals(internalApiKey)) {
            log.warn("Invalid or missing internal API key for request to {}", request.getRequestURI());
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid internal API key");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
