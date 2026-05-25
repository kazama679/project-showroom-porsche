package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.service.IEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService
{
    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String to, String otp)
    {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Porsche Showroom - Verify your email");
        message.setText(
                "Welcome to Porsche Showroom!\n\n" +
                "Your OTP verification code is: " + otp + "\n\n" +
                "This code will expire in 5 minutes.\n\n" +
                "If you did not request this, please ignore this email."
        );

        mailSender.send(message);
    }
}
