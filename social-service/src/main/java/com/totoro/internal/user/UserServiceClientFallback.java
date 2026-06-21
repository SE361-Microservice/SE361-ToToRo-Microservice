package com.totoro.internal.user;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.common.enums.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserProfileDto getUserProfile(Long userId) {
        log.warn("Circuit breaker triggered or Identity Service is down. Using fallback for userId: {}", userId);
        // Provide a safe fallback user profile
        return UserProfileDto.builder()
                .id(userId)
                .fullName("Unknown User")
                .email("unknown@totoro.com")
                .role(Role.USER)
                .build();
    }
}




