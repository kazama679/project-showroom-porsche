package com.ra.base_spring_boot.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.ra.base_spring_boot.entity.TestDriveBooking;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendInquiryEmail(String toEmail, String dealerName, String dealerAddress, String carName, String porscheCode, Double price, String userMessage, String carImageUrl, Long carOptionId) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your message to " + dealerName + " was sent");

            String imageUrl = (carImageUrl != null && !carImageUrl.isEmpty()) ? carImageUrl : "https://configurator.porsche.com/public/fallback-D2RQp9E7.webp";
            String formattedPrice = price != null ? String.format("$%,.2f", price) : "N/A";

            String linkPath = (porscheCode != null && !porscheCode.isEmpty() && !porscheCode.equals("P-0000")) ? porscheCode : ((carOptionId != null) ? String.valueOf(carOptionId) : "");
            String link = "http://localhost:3000/configurator/" + linkPath;

            String htmlContent = "<div style='font-family: Arial, sans-serif; color: #000; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='text-align: center; padding: 20px 0;'>"
                    + "<img src='https://newsroom.porsche.com/.imaging/mte/porsche-templating-theme/image_1080x624/dam/pnr/2021/Startseite---Banner/Porsche_Wordmark_black_rgb.png/jcr:content/Porsche_Wordmark_black_rgb.png' alt='Porsche' width='150'/>"
                    + "</div>"
                    + "<h2 style='font-size: 24px; font-weight: bold; margin-bottom: 20px;'>Your message to " + dealerName + " was sent</h2>"
                    + "<div style='border: 1px solid #eaeaea; border-radius: 8px; padding: 0; margin-bottom: 30px; overflow: hidden;'>"
                    + "<div style='background-color: #f5f5f5;'><img src='" + imageUrl + "' alt='Car' style='width: 100%; display: block;'/></div>"
                    + "<div style='padding: 20px;'>"
                    + "<h3 style='margin: 0 0 10px 0; font-size: 20px;'>" + carName + "</h3>"
                    + "<p style='margin: 0 0 20px 0; font-size: 14px; color: #666;'>Porsche Code · " + porscheCode + "</p>"
                    + "<p style='font-size: 18px; font-weight: bold; margin: 0 0 20px 0;'>" + formattedPrice + "</p>"
                    + "<a href='" + link + "' style='display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 14px; font-weight: bold;'>Porsche Car Configurator</a>"
                    + "</div></div>"
                    + "<p style='font-size: 14px; line-height: 1.5; margin-bottom: 20px;'>Thanks for your interest in Porsche. Your inquiry was sent to " + dealerName + ". We'll get back to you as soon as possible.</p>"
                    + "<p style='font-size: 14px; font-weight: bold; margin-bottom: 5px;'>Your message to " + dealerName + ":</p>"
                    + "<p style='font-size: 14px; font-style: italic; margin-bottom: 30px;'>" + userMessage + "</p>"
                    + "<hr style='border: 0; border-top: 1px solid #eaeaea; margin-bottom: 20px;'/>"
                    + "<p style='font-size: 14px; margin: 0 0 5px 0;'><strong>" + dealerName + "</strong></p>"
                    + "<p style='font-size: 14px; margin: 0 0 5px 0;'>" + dealerAddress + "</p>"
                    + "<p style='font-size: 14px; margin: 0 0 30px 0;'>&#9742; Connect with dealer</p>"
                    + "<p style='font-size: 14px; font-weight: bold; margin-bottom: 10px;'>Connect with Porsche.</p>"
                    + "<p style='font-size: 12px; color: #666; margin-top: 30px;'>&copy; 2026 Porsche Sales & Marketplace, Inc.<br/><a href='https://www.porsche.com' style='color: #000;'>www.porsche.com</a></p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    // Email khi người dùng submit booking
    public void sendTestDriveSubmittedEmail(String toEmail, TestDriveBooking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("[Porsche] Đăng ký lái thử của bạn đã được nhận");
            String html = "<div style='font-family:Arial,sans-serif;color:#000;max-width:600px;margin:auto;'>"
                    + "<h2>Đăng ký lái thử đã nhận</h2>"
                    + "<p>Cảm ơn <strong>" + (booking.getFirstName()!=null?booking.getFirstName():"") + " " + (booking.getLastName()!=null?booking.getLastName():"") + "</strong> đã đăng ký lái thử cho mẫu " + booking.getCarName() + ".</p>"
                    + "<p><strong>Ngày:</strong> " + (booking.getPreferredDate()!=null ? booking.getPreferredDate().format(DateTimeFormatter.ISO_DATE) : "N/A") + "</p>"
                    + "<p>Chúng tôi sẽ liên hệ lại sớm nhất.</p>"
                    + "</div>";
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[MailService] Gửi email submit booking thất bại: " + e.getMessage());
        }
    }

    // Email khi admin APPROVE booking
    public void sendTestDriveApprovedEmail(String toEmail, TestDriveBooking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("[Porsche] Đăng ký lái thử của bạn đã được duyệt");
            String fullName = ((booking.getFirstName() != null ? booking.getFirstName() : "") + " "
                    + (booking.getLastName() != null ? booking.getLastName() : "")).trim();
            String schedule = formatTestDriveSchedule(booking);
            String html = "<div style='font-family:Arial,sans-serif;color:#000;max-width:600px;margin:auto;'>"
                    + "<h2>Đăng ký lái thử đã được duyệt</h2>"
                    + "<p>Xin chào <strong>" + fullName + "</strong>,</p>"
                    + "<p>Yêu cầu lái thử của bạn cho mẫu <strong>" + booking.getCarName() + "</strong> đã được duyệt.</p>"
                    + "<p>Hãy sắp xếp lịch vào thời gian <strong>" + schedule + "</strong> để đến " + booking.getDealerName() + ".</p>"
                    + "<p>Mọi thắc mắc hãy liên hệ: <a href='mailto:quanglienha123@gmail.com' style='color:#000;'>quanglienha123@gmail.com</a> hoặc gọi tới số: <a href='tel:0349199812' style='color:#000;'>0349199812</a>.</p>"
                    + "</div>";
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[MailService] Gửi email approve booking thất bại: " + e.getMessage());
        }
    }

    private String formatTestDriveSchedule(TestDriveBooking booking) {
        String date = booking.getPreferredDate() != null
                ? booking.getPreferredDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "";
        String time = booking.getPreferredTime() != null && !booking.getPreferredTime().isBlank()
                ? booking.getPreferredTime()
                : "";

        if (!date.isBlank() && !time.isBlank()) {
            return time + " " + date;
        }
        if (!date.isBlank()) {
            return date;
        }
        if (!time.isBlank()) {
            return time;
        }
        return "đã đăng ký";
    }

    // Email khi admin REJECT booking
    public void sendTestDriveRejectedEmail(String toEmail, TestDriveBooking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("[Porsche] Đăng ký lái thử của bạn đã bị từ chối");
            String html = "<div style='font-family:Arial,sans-serif;color:#000;max-width:600px;margin:auto;'>"
                    + "<h2>Đăng ký lái thử đã bị từ chối</h2>"
                    + "<p>Xin chào <strong>" + (booking.getFirstName()!=null?booking.getFirstName():"") + " " + (booking.getLastName()!=null?booking.getLastName():"") + "</strong>,</p>"
                    + "<p>Yêu cầu lái thử của bạn cho mẫu <strong>" + booking.getCarName() + "</strong> đã bị từ chối.</p>"
                    + "<p>Ghi chú của admin: " + (booking.getAdminNote()!=null?booking.getAdminNote():"Không có") + "</p>"
                    + "</div>";
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[MailService] Gửi email reject booking thất bại: " + e.getMessage());
        }
    }
}
