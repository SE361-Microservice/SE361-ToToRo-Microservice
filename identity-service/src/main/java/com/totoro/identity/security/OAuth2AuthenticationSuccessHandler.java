package com.totoro.identity.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;

    @Value("${app.frontend.oauth2-redirect-url}")
    private String frontendOAuth2RedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String token = tokenProvider.generateToken(authentication);

        // Detect if this is a brand-new Google account
        boolean isNewUser = false;
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            isNewUser = userDetails.isNewUser();
        }

        // Redirect to frontend with token (and isNewUser flag for onboarding popup)
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendOAuth2RedirectUrl)
                .queryParam("token", token);
        if (isNewUser) {
            builder.queryParam("isNewUser", "true");
        }
        String targetUrl = builder.build().toUriString();

        log.debug("OAuth2 login success, redirecting to: {}, isNewUser={}", frontendOAuth2RedirectUrl, isNewUser);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
