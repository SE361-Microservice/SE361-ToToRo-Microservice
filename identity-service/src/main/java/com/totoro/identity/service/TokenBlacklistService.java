package com.totoro.identity.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;

    public void blacklist(String token, long ttlMillis) {
        if (ttlMillis > 0) {
            redisTemplate.opsForValue().set(
                    "blacklist:" + token,
                    "revoked",
                    ttlMillis,
                    TimeUnit.MILLISECONDS
            );
        }
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
    }
}
