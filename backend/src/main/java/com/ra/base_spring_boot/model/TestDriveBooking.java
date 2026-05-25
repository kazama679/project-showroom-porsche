package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_drive_bookings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TestDriveBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable user reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
    private User user;

    // Nullable car model reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", referencedColumnName = "id", nullable = true)
    private CarModel carModel;

    @Column(name = "car_name")
    private String carName;
    @Column(name = "porsche_code")
    private String porscheCode;
    @Column(name = "dealer_name")
    private String dealerName;
    @Column(name = "dealer_address")
    private String dealerAddress;
    @Column(name = "salutation")
    private String salutation;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "last_name")
    private String lastName;
    @Column(name = "email")
    private String email;
    @Column(name = "country_code")
    private String countryCode;
    @Column(name = "phone_number")
    private String phoneNumber;
    @Column(name = "preferred_date")
    private LocalDate preferredDate;
    @Column(name = "preferred_time")
    private String preferredTime;
    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TestDriveBookingStatus status = TestDriveBookingStatus.PENDING;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
