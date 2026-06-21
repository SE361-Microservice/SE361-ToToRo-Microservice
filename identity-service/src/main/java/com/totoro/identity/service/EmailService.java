package com.totoro.identity.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend.verify-email-url}")
    private String verifyEmailUrl;

    @Value("${app.frontend.reset-password-url}")
    private String resetPasswordUrl;

    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "Xác minh địa chỉ email - ToToRo";
        String verifyLink = verifyEmailUrl + "?token=" + token;
        String content = "<h3>Chào mừng bạn đến với ToToRo!</h3>" +
                "<p>Vui lòng xác minh địa chỉ email bằng cách nhấn vào liên kết bên dưới:</p>" +
                "<br><a href=\"" + verifyLink + "\">Xác minh email</a>" +
                "<br><p>Cảm ơn bạn!</p>";
        sendHtmlEmail(toEmail, subject, content);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String subject = "Đặt lại mật khẩu - ToToRo";
        String resetLink = resetPasswordUrl + "?token=" + token;
        String content = "<h3>Yêu cầu đặt lại mật khẩu</h3>" +
                "<p>Vui lòng nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>" +
                "<br><a href=\"" + resetLink + "\">Đặt lại mật khẩu</a>" +
                "<br><p>Liên kết có hiệu lực trong 15 phút.</p>" +
                "<br><p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>";
        sendHtmlEmail(toEmail, subject, content);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Bỏ qua gửi email vì chưa cấu hình MAIL_USERNAME. To: {}, Subject: {}", toEmail, subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Gửi email thành công tới {}", toEmail);
        } catch (MessagingException | MailException e) {
            log.error("Gửi email thất bại tới {}", toEmail, e);
        }
    }
}
