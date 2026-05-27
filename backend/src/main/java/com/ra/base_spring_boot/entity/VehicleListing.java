package com.ra.base_spring_boot.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicle_listings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class VehicleListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. Vehicle Information
    @Column(length = 17)
    private String vin;
    @Column(length = 100)
    private String make;
    @Column(length = 100)
    private String model;
    @Column(name = "trim_level", length = 100)
    private String trimLevel;
    @Column(name = "model_year")
    private Integer modelYear;
    private Integer mileage;
    @Column(name = "exterior_color", length = 100)
    private String exteriorColor;
    @Column(name = "interior_color", length = 100)
    private String interiorColor;
    @Column(name = "fuel_type", length = 50)
    private String fuelType;
    @Column(length = 50)
    private String transmission;
    @Column(length = 50)
    private String drivetrain;
    private Integer seats;
    @Column(name = "registration_area", length = 200)
    private String registrationArea;

    // 2. Pricing & Transaction
    @Column(name = "asking_price", precision = 12, scale = 2)
    private BigDecimal askingPrice;
    @Column(name = "is_negotiable")
    private Boolean isNegotiable;
    @Column(name = "payment_methods", length = 500)
    private String paymentMethods;
    @Column(name = "has_lien")
    private Boolean hasLien;
    @Column(name = "zip_code", length = 20)
    private String zipCode;
    @Column(length = 200)
    private String city;
    @Column(name = "state_province", length = 200)
    private String stateProvince;
    @Column(name = "supports_shipping")
    private Boolean supportsShipping;
    @Column(name = "accepts_trade_in")
    private Boolean acceptsTradeIn;

    // 3. Vehicle Condition
    @Column(name = "has_accident")
    private Boolean hasAccident;
    @Column(name = "accident_description", columnDefinition = "TEXT")
    private String accidentDescription;
    @Column(name = "has_flood_damage")
    private Boolean hasFloodDamage;
    @Column(name = "has_repaint")
    private Boolean hasRepaint;
    @Column(name = "repaint_description", length = 500)
    private String repaintDescription;
    @Column(name = "engine_condition", length = 200)
    private String engineCondition;
    @Column(name = "transmission_condition", length = 200)
    private String transmissionCondition;
    @Column(name = "tire_condition", length = 200)
    private String tireCondition;
    @Column(name = "brake_condition", length = 200)
    private String brakeCondition;
    @Column(name = "has_warning_lights")
    private Boolean hasWarningLights;
    @Column(name = "has_electrical_issues")
    private Boolean hasElectricalIssues;
    @Column(name = "has_modifications")
    private Boolean hasModifications;
    @Column(name = "modifications_description", length = 500)
    private String modificationsDescription;
    @Column(name = "has_smoking_pet_exposure")
    private Boolean hasSmokingPetExposure;
    @Column(name = "condition_description", columnDefinition = "TEXT")
    private String conditionDescription;

    // 4. Maintenance History & Documents
    @Column(name = "has_service_records")
    private Boolean hasServiceRecords;
    @Column(name = "dealer_serviced")
    private Boolean dealerServiced;
    @Column(name = "last_service_mileage")
    private Integer lastServiceMileage;
    @Column(name = "has_repair_invoices")
    private Boolean hasRepairInvoices;
    @Column(name = "title_status", length = 50)
    private String titleStatus;
    @Column(name = "has_open_recalls")
    private Boolean hasOpenRecalls;
    @Column(name = "registration_valid_until", length = 50)
    private String registrationValidUntil;
    @Column(name = "owner_number")
    private Integer ownerNumber;
    @Column(name = "has_carfax_report")
    private Boolean hasCarfaxReport;

    // 5. Seller Contact
    @Column(name = "seller_full_name", length = 200)
    private String sellerFullName;
    @Column(name = "seller_phone", length = 50)
    private String sellerPhone;
    @Column(name = "seller_email", length = 200)
    private String sellerEmail;
    @Column(name = "seller_city", length = 200)
    private String sellerCity;
    @Column(name = "seller_state", length = 200)
    private String sellerState;
    @Column(name = "seller_type", length = 50)
    private String sellerType;
    @Column(name = "preferred_contact_time", length = 200)
    private String preferredContactTime;
    @Column(name = "preferred_contact_method", length = 200)
    private String preferredContactMethod;

    // Status & Timestamps
    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";
    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relations
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VehicleListingImage> images = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
