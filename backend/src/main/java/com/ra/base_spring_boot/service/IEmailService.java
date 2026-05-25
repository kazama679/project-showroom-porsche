package com.ra.base_spring_boot.service;

public interface IEmailService
{
    void sendOtpEmail(String to, String otp);
}
