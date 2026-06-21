package com.totoro.identity.controller;

import com.totoro.common.dto.PageResponse;
import com.totoro.identity.dto.UserProfileResponse;
import com.totoro.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<PageResponse<UserProfileResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return ResponseEntity.ok(userService.getAllUsersForAdmin(pageable));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<Map<String, String>> changeUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }
        userService.changeUserRole(userId, newRole);
        return ResponseEntity.ok(Map.of("message", "Role updated successfully", "role", newRole.toUpperCase()));
    }

    @PatchMapping("/{userId}/block")
    public ResponseEntity<Map<String, Object>> changeUserBlockStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body) {
        Boolean block = body.get("block");
        if (block == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Block status is required"));
        }
        userService.changeUserBlockStatus(userId, block);
        return ResponseEntity.ok(Map.of("message", "User block status updated", "isBlocked", block));
    }
}
