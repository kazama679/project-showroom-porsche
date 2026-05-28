package com.ra.base_spring_boot.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VehicleInquiryRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
    
    private String salutation;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String countryCode;
    private String phoneNumber;
    private String zipCode;
    
    @NotBlank(message = "Message is required")
    private String message;
}
