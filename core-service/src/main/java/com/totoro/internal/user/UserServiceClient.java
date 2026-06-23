package com.totoro.internal.user;

import com.totoro.common.dto.UserProfileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service", url = "${identity.service.url:http://localhost:8081}", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    @GetMapping("/internal/users/{userId}")
    UserProfileDto getUserProfile(@PathVariable("userId") Long userId);
}
