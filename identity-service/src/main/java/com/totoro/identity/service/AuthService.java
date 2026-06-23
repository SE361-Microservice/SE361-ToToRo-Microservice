package com.totoro.identity.service;

import com.totoro.identity.dto.*;
import com.totoro.identity.entity.AuthProvider;
import com.totoro.identity.entity.User;
import com.totoro.identity.entity.UserProfile;
import com.totoro.identity.repository.UserProfileRepository;
import com.totoro.identity.repository.UserRepository;
import com.totoro.identity.security.CustomUserDetails;
import com.totoro.identity.security.JwtTokenProvider;
import com.totoro.identity.event.UserEventPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final UserEventPublisher userEventPublisher;


    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        // Validate and normalize role input
        String role = normalizeRole(request.getRole());

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .provider(AuthProvider.LOCAL)
                .isVerified(false)
                .isBlocked(false)
                .build();

        // Use reset_token column to store email verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setResetToken(verificationToken);

        user = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .fullName(request.getFullName())
                .build();
        userProfileRepository.save(profile);

        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        log.info("User registered: {}", user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new IllegalArgumentException("Vui lòng xác minh email trước khi đăng nhập.");
        }

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = UUID.randomUUID().toString();

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .message("Đăng nhập thành công")
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Mã xác minh không hợp lệ hoặc đã hết hạn"));

        user.setIsVerified(true);
        user.setResetToken(null);
        userRepository.save(user);
        log.info("Email verified for user: {}", user.getEmail());

        // Bắn event user-updated để social-service cache lại user này
        try {
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
            userEventPublisher.publishUserUpdated(
                    user.getId(),
                    user.getEmail(),
                    profile != null ? profile.getFullName() : "",
                    profile != null ? profile.getAvatarUrl() : null
            );
        } catch (Exception e) {
            log.warn("Failed to publish user-updated event during email verification for userId={}: {}", user.getId(), e.getMessage());
        }
    }


    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email này"));

        if (!user.getProvider().equals(AuthProvider.LOCAL)) {
            throw new IllegalArgumentException("Tài khoản đăng ký bằng Google không hỗ trợ đặt lại mật khẩu.");
        }

        String resetToken = UUID.randomUUID().toString().substring(0, 8);
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Mã đặt lại mật khẩu không hợp lệ"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã đặt lại mật khẩu đã hết hạn");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Refresh token không hợp lệ"));

        if (user.getRefreshTokenExpiry() == null || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }

        String accessToken = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(user.getRefreshToken())
                .message("Làm mới token thành công")
                .build();
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) return "USER";
        return switch (role.toUpperCase()) {
            case "LANDLORD" -> "LANDLORD";
            case "ADMIN" -> throw new IllegalArgumentException("Không thể tự đăng ký với quyền ADMIN");
            default -> "USER";
        };
    }
}
