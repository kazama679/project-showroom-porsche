package com.ra.base_spring_boot.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InquiryRequest {
    private String salutation;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    @Email
    private String email;
    private String countryCode;
    private String phoneNumber;
    private String message;
    private String dealerName;
    private String dealerAddress;
    private String porscheCode;
    private String carName;
    private Double carPrice;
    private Double basePrice;
}
