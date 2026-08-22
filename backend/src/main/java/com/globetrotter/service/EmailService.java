package com.globetrotter.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@globetrotter.io}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // 1. Try real SMTP email dispatch if JavaMailSender is configured
        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("Reset Your GlobeTrotter Password");

                String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0d1a2f; color: #FAF7F2; border-radius: 8px;'>"
                        + "<h2 style='color: #F5A623; margin-top: 0;'>✈ GlobeTrotter Travel Planner</h2>"
                        + "<p>Hello Traveler,</p>"
                        + "<p>We received a request to reset your password. Click the button below to choose a new password:</p>"
                        + "<div style='text-align: center; margin: 30px 0;'>"
                        + "<a href='" + resetLink + "' style='background-color: #F5A623; color: #060E1A; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;'>Reset Password</a>"
                        + "</div>"
                        + "<p style='color: #9BACC9; font-size: 12px;'>This link will expire in 24 hours. If you did not request a password reset, you can safely ignore this email.</p>"
                        + "<hr style='border: none; border-top: 1px solid #1B2D4A; margin: 20px 0;' />"
                        + "<p style='color: #7088AD; font-size: 11px;'>Direct link: <a href='" + resetLink + "' style='color: #F5A623;'>" + resetLink + "</a></p>"
                        + "</div>";

                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println("✅ [EMAIL SENT] Live password reset email dispatched via SMTP to " + toEmail);
                return;
            } catch (Exception e) {
                System.out.println("ℹ [SMTP NOTICE] Could not send via SMTP (" + e.getMessage() + "). Falling back to secure server log.");
            }
        }

        // 2. Server-side log (Never exposed to the public API response)
        System.out.println("=======================================================================");
        System.out.println("📧 [GLOBETROTTER EMAIL DISPATCH]");
        System.out.println("   To:        " + toEmail);
        System.out.println("   Subject:   Reset Your GlobeTrotter Password");
        System.out.println("   Reset URL: " + resetLink);
        System.out.println("=======================================================================");
    }
}
