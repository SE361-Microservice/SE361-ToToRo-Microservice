package com.totoro.identity.security;

import com.totoro.identity.entity.AuthProvider;
import com.totoro.identity.entity.User;
import com.totoro.identity.entity.UserProfile;
import com.totoro.identity.repository.UserProfileRepository;
import com.totoro.identity.repository.UserRepository;
import com.totoro.identity.event.UserEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserEventPublisher userEventPublisher;


    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new OAuth2AuthenticationException("Không tìm thấy email từ nhà cung cấp OAuth2");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().equals(AuthProvider.GOOGLE)) {
                throw new OAuth2AuthenticationException(
                        "Tài khoản đã đăng ký bằng " + user.getProvider() + ". Vui lòng đăng nhập đúng phương thức."
                );
            }
            // Update avatar url in case it changed on Google side
            updateExistingUser(user, oAuth2User);
        } else {
            user = registerNewGoogleUser(oAuth2User);
        }

        return CustomUserDetails.create(user, oAuth2User.getAttributes());
    }

    private User registerNewGoogleUser(OAuth2User oAuth2User) {
        User user = User.builder()
                .email(oAuth2User.getAttribute("email"))
                .provider(AuthProvider.GOOGLE)
                .providerId(oAuth2User.getAttribute("sub"))
                .role("USER")          // Default role for Google sign-ups
                .isVerified(true)      // Google accounts are pre-verified
                .isBlocked(false)
                .build();
        user = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .fullName(oAuth2User.getAttribute("name"))
                .avatarUrl(oAuth2User.getAttribute("picture"))
                .build();
        userProfileRepository.save(profile);

        // Bắn event user-updated cho social-service cache
        try {
            userEventPublisher.publishUserUpdated(
                    user.getId(),
                    user.getEmail(),
                    profile.getFullName(),
                    profile.getAvatarUrl()
            );
        } catch (Exception e) {
            // Không rollback flow auth nếu kafka lỗi
        }

        return user;
    }

    private void updateExistingUser(User existingUser, OAuth2User oAuth2User) {
        // Update avatar from Google if profile exists
        userProfileRepository.findByUserId(existingUser.getId()).ifPresent(profile -> {
            String latestAvatar = oAuth2User.getAttribute("picture");
            boolean changed = false;
            if (latestAvatar != null && !latestAvatar.equals(profile.getAvatarUrl())) {
                profile.setAvatarUrl(latestAvatar);
                userProfileRepository.save(profile);
                changed = true;
            }
            // Luôn đảm bảo social-service được đồng bộ
            if (changed) {
                try {
                    userEventPublisher.publishUserUpdated(
                            existingUser.getId(),
                            existingUser.getEmail(),
                            profile.getFullName(),
                            profile.getAvatarUrl()
                    );
                } catch (Exception e) {
                }
            }
        });
    }
}
