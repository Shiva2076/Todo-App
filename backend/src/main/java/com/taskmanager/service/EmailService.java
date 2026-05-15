package com.taskmanager.service;

import com.taskmanager.document.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.from-email}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            Context ctx = new Context();
            ctx.setVariable("name", fullName);
            ctx.setVariable("frontendUrl", frontendUrl);

            String html = templateEngine.process("welcome-email", ctx);
            sendEmail(toEmail, "Welcome to Smart Task Manager, " + fullName + "!", html);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendTaskReminder(String toEmail, String assigneeName, Task task) {
        try {
            Context ctx = new Context();
            ctx.setVariable("name", assigneeName);
            ctx.setVariable("taskTitle", task.getTitle());
            ctx.setVariable("taskPriority", task.getPriority().name());
            ctx.setVariable("dueDate", task.getDueDate().toString());
            ctx.setVariable("taskUrl", frontendUrl + "/tasks/" + task.getId());

            String html = templateEngine.process("reminder-email", ctx);
            sendEmail(toEmail, "⏰ Task Due Soon: " + task.getTitle(), html);
        } catch (Exception e) {
            log.error("Failed to send reminder email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
        log.debug("Email sent to {} with subject: {}", to, subject);
    }
}
