package com.ra.base_spring_boot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleListingRequest {
    // 1. Vehicle Information
    private String vin;
    private String make;
    private String model;
    private String trimLevel;
    private Integer modelYear;
    private Integer mileage;
    private String exteriorColor;
    private String interiorColor;
    private String fuelType;
    private String transmission;
    private String drivetrain;
    private Integer seats;
    private String registrationArea;

    // 2. Pricing & Transaction
    private BigDecimal askingPrice;
    private Boolean isNegotiable;
    private String paymentMethods;
    private Boolean hasLien;
    private String zipCode;
    private String city;
    private String stateProvince;
    private Boolean supportsShipping;
    private Boolean acceptsTradeIn;

    // 3. Vehicle Condition
    private Boolean hasAccident;
    private String accidentDescription;
    private Boolean hasFloodDamage;
    private Boolean hasRepaint;
    private String repaintDescription;
    private String engineCondition;
    private String transmissionCondition;
    private String tireCondition;
    private String brakeCondition;
    private Boolean hasWarningLights;
    private Boolean hasElectricalIssues;
    private Boolean hasModifications;
    private String modificationsDescription;
    private Boolean hasSmokingPetExposure;
    private String conditionDescription;

    // 4. Maintenance History & Documents
    private Boolean hasServiceRecords;
    private Boolean dealerServiced;
    private Integer lastServiceMileage;
    private Boolean hasRepairInvoices;
    private String titleStatus;
    private Boolean hasOpenRecalls;
    private String registrationValidUntil;
    private Integer ownerNumber;
    private Boolean hasCarfaxReport;

    // 5. Seller Contact
    @NotBlank
    private String sellerFullName;
    private String sellerPhone;
    @NotBlank
    private String sellerEmail;
    private String sellerCity;
    private String sellerState;
    private String sellerType;
    private String preferredContactTime;
    private String preferredContactMethod;
}
