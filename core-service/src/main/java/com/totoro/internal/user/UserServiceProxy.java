package com.totoro.internal.user;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.common.enums.Role;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Proxy service wrapping UserServiceClient (Feign) with explicit
 * Resilience4j Circuit Breaker and Retry annotations.
 *
 * When Identity Service is down:
 *   - Retry 3 times with 500ms delay
 *   - After 50% failure rate → Circuit OPEN (stops calling for 10s)
 *   - Fallback returns a safe "Unknown User" profile
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceProxy {

    private final UserServiceClient userServiceClient;

    private static final String CB_NAME = "userServiceCB";

    @CircuitBreaker(name = CB_NAME, fallbackMethod = "getUserProfileFallback")
    @Retry(name = CB_NAME)
    public UserProfileDto getUserProfile(Long userId) {
        return userServiceClient.getUserProfile(userId);
    }

    /**
     * Fallback invoked when circuit is OPEN or all retries exhausted.
     */
    private UserProfileDto getUserProfileFallback(Long userId, Throwable t) {
        log.warn("[CircuitBreaker] Identity Service unavailable for userId={}. Reason: {}. Using fallback.",
                userId, t.getClass().getSimpleName());
        return UserProfileDto.builder()
                .id(userId)
                .fullName("Unknown User")
                .email("unknown@totoro.com")
                .role(Role.USER)
                .build();
    }
}
