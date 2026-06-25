package com.totoro.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@Slf4j
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final List<String> publicPaths = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/verify",           // ← was /api/auth/verify-email (wrong)
            "/api/auth/forgot-password",  // ← missing
            "/api/auth/reset-password",
            "/api/auth/refresh-token",    // ← was /api/auth/refresh (wrong)
            "/api/auth/google/**",
            "/api/listings",              // ← public GET for listings
            "/api/listings/**",           // ← public GET for listing detail
            "/api/tags",                  // ← public GET for tags
            "/api/reviews",               // ← public GET for reviews
            "/api/reviews/**",            // ← public GET for reviews detail/sub-paths
            "/api/community/posts",       // ← public GET for community posts
            "/api/community/posts/**",     // ← public GET for community posts detail/sub-paths
            "/oauth2/**",
            "/login/oauth2/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/webjars/**",
            "/actuator/**"
    );

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {
        // Configuration fields if needed
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Always allow CORS preflight (OPTIONS) requests through
            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }
            String path = request.getURI().getPath();

            // Determine if the path is public
            boolean isPublicPath = publicPaths.stream()
                    .anyMatch(pattern -> pathMatcher.match(pattern, path));

            String token = getJwtFromRequest(request);

            if (!StringUtils.hasText(token)) {
                if (isPublicPath) {
                    return chain.filter(exchange);
                }
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            try {
                Claims claims = Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                Object userIdObj = claims.get("userId");
                if (userIdObj == null) {
                    if (isPublicPath) {
                        return chain.filter(exchange);
                    }
                    return onError(exchange, "Invalid JWT token claims", HttpStatus.UNAUTHORIZED);
                }

                String userId = userIdObj.toString();

                // Mutate request headers to forward user ID to downstream microservices
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId)
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                log.error("JWT Validation failed: {}", e.getMessage());
                if (isPublicPath) {
                    return chain.filter(exchange);
                }
                return onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private String getJwtFromRequest(ServerHttpRequest request) {
        String bearerToken = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        // WebSocket query parameter fallback
        String queryToken = request.getQueryParams().getFirst("token");
        if (StringUtils.hasText(queryToken)) {
            return queryToken;
        }
        
        return null;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format("{\"error\": \"%s\", \"message\": \"%s\"}", status.getReasonPhrase(), err);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
}
