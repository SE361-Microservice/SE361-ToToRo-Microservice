package com.totoro.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {
    public void sendNotificationEmail(String recipientEmail, String subject, String htmlContent) {
        log.info("MOCK Email sent to {}: {}", recipientEmail, subject);
    }
}

