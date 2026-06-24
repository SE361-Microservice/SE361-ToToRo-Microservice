package com.totoro.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks online user presence via WebSocket sessions.
 * <p>
 * Each user may have multiple sessions (multiple tabs/devices).
 * A user is considered "online" as long as at least one session is active.
 */
@Slf4j
@Service
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Maps email -> set of session IDs.
     * Using ConcurrentHashMap + ConcurrentHashMap.newKeySet for thread safety.
     */
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();

    /**
     * Maps email -> userId (Long). Populated on connect so we can broadcast userId.
     */
    private final Map<String, Long> emailToUserId = new ConcurrentHashMap<>();

    public PresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Register a user session. If this is the user's first session, broadcast "online".
     */
    public void userConnected(String email, Long userId, String sessionId) {
        emailToUserId.putIfAbsent(email, userId);
        Set<String> sessions = userSessions.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet());
        boolean wasOffline = sessions.isEmpty();
        sessions.add(sessionId);

        if (wasOffline) {
            log.info("User came online: {} (id={})", email, userId);
            broadcastPresence(userId, true);
        }
    }

    /**
     * Unregister a user session. If no sessions remain, broadcast "offline".
     */
    public void userDisconnected(String email, String sessionId) {
        Set<String> sessions = userSessions.get(email);
        if (sessions == null) return;

        sessions.remove(sessionId);

        if (sessions.isEmpty()) {
            userSessions.remove(email);
            Long userId = emailToUserId.remove(email);
            log.info("User went offline: {} (id={})", email, userId);
            if (userId != null) {
                broadcastPresence(userId, false);
            }
        }
    }

    /**
     * Check if a user is currently online.
     */
    public boolean isOnline(String email) {
        Set<String> sessions = userSessions.get(email);
        return sessions != null && !sessions.isEmpty();
    }

    /**
     * Get the set of all currently online user IDs.
     */
    public Set<Long> getOnlineUserIds() {
        Set<Long> onlineIds = ConcurrentHashMap.newKeySet();
        for (Map.Entry<String, Set<String>> entry : userSessions.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                Long userId = emailToUserId.get(entry.getKey());
                if (userId != null) {
                    onlineIds.add(userId);
                }
            }
        }
        return onlineIds;
    }

    /**
     * Broadcast a presence change to all connected clients.
     */
    private void broadcastPresence(Long userId, boolean online) {
        Map<String, Object> payload = Map.of(
                "userId", userId,
                "online", online
        );
        messagingTemplate.convertAndSend("/topic/presence", (Object) payload);
    }
}
