package com.totoro.identity.controller;

import com.totoro.identity.dto.ChangePasswordRequest;
import com.totoro.identity.dto.CompleteOnboardingRequest;
import com.totoro.identity.dto.UpdateProfileRequest;
import com.totoro.identity.dto.UserProfileResponse;
import com.totoro.identity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteAccount(Authentication authentication) {
        userService.deleteAccount(authentication.getName());
        return ResponseEntity.ok("Tài khoản đã được xóa");
    }

    /**
     * Called once after a new Google sign-up to let the user pick their role
     * (USER / LANDLORD) and complete their profile (phone, university, bio).
     */
    @PostMapping("/me/complete-onboarding")
    public ResponseEntity<UserProfileResponse> completeOnboarding(
            Authentication authentication,
            @Valid @RequestBody CompleteOnboardingRequest request) {
        return ResponseEntity.ok(userService.completeOnboarding(authentication.getName(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfileById(id));
    }
}
