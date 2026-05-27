package com.ra.base_spring_boot.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VehicleListingResponse {
    private Long id;

    // Vehicle Info
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

    // Pricing
    private BigDecimal askingPrice;
    private Boolean isNegotiable;
    private String paymentMethods;
    private Boolean hasLien;
    private String zipCode;
    private String city;
    private String stateProvince;
    private Boolean supportsShipping;
    private Boolean acceptsTradeIn;

    // Condition
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

    // Documents
    private Boolean hasServiceRecords;
    private Boolean dealerServiced;
    private Integer lastServiceMileage;
    private Boolean hasRepairInvoices;
    private String titleStatus;
    private Boolean hasOpenRecalls;
    private String registrationValidUntil;
    private Integer ownerNumber;
    private Boolean hasCarfaxReport;

    // Seller
    private String sellerFullName;
    private String sellerPhone;
    private String sellerEmail;
    private String sellerCity;
    private String sellerState;
    private String sellerType;
    private String preferredContactTime;
    private String preferredContactMethod;

    // Status
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Images
    private List<ImageInfo> images;

    @Data
    @Builder
    public static class ImageInfo {
        private Long id;
        private String imageUrl;
        private String imageType;
        private Boolean isRequired;
        private Boolean isSensitive;
        private Integer sortOrder;
    }
}
