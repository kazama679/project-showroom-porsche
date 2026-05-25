package com.ra.base_spring_boot.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TestDriveBookingRequest {
    private Long carModelId;
    private String carName;
    private String porscheCode;
    private String dealerName;
    private String dealerAddress;
    private String salutation;
    private String firstName;
    private String lastName;
    @Email
    @NotBlank
    private String email;
    private String countryCode;
    private String phoneNumber;
    private LocalDate preferredDate;
    private String preferredTime;
    private String message;

    // Getters and Setters (Lombok could be used but keep explicit for clarity)
    public Long getCarModelId() { return carModelId; }
    public void setCarModelId(Long carModelId) { this.carModelId = carModelId; }
    public String getCarName() { return carName; }
    public void setCarName(String carName) { this.carName = carName; }
    public String getPorscheCode() { return porscheCode; }
    public void setPorscheCode(String porscheCode) { this.porscheCode = porscheCode; }
    public String getDealerName() { return dealerName; }
    public void setDealerName(String dealerName) { this.dealerName = dealerName; }
    public String getDealerAddress() { return dealerAddress; }
    public void setDealerAddress(String dealerAddress) { this.dealerAddress = dealerAddress; }
    public String getSalutation() { return salutation; }
    public void setSalutation(String salutation) { this.salutation = salutation; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public LocalDate getPreferredDate() { return preferredDate; }
    public void setPreferredDate(LocalDate preferredDate) { this.preferredDate = preferredDate; }
    public String getPreferredTime() { return preferredTime; }
    public void setPreferredTime(String preferredTime) { this.preferredTime = preferredTime; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
