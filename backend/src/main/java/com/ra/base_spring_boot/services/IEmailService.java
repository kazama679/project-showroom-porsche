package com.ra.base_spring_boot.services;

public interface IEmailService
{
    void sendOtpEmail(String to, String otp);
}
