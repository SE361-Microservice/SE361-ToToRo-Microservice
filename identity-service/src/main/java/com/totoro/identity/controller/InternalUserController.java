package com.totoro.identity.controller;

import com.totoro.common.dto.UserProfileDto;
import com.totoro.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal API Controller - NOT exposed through API Gateway to external clients.
 * Used exclusively by other microservices (core-service, social-service) via direct HTTP/Feign calls
 * within the Docker/K8s internal network.
 *
 * Gateway configuration must block any request with prefix /internal/** from external sources.
 */
@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    /**
     * GET /internal/users/{userId}
     * Returns lightweight UserProfileDto (from common.jar) for a single user.
     * Used by core-service to show author info on a Listing, etc.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getInternalUserProfile(userId));
    }

    /**
     * POST /internal/users/batch
     * Body: [1, 2, 3]
     * Returns Map<userId, UserProfileDto> for batch lookups.
     * Used by social-service (Chat) to load member info of a conversation in a single call.
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<Long, UserProfileDto>> getUserProfiles(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(userService.getBatchInternalUserProfiles(userIds));
    }

    /**
     * GET /internal/users/{userId}/exists
     * Used by social-service (Review) to validate that a user ID exists before allowing an action.
     */
    @GetMapping("/{userId}/exists")
    public ResponseEntity<Boolean> existsById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.existsById(userId));
    }
}
