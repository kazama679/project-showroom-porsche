package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_inquiries")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ContactInquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "salutation")
    private String salutation;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "dealer_name")
    private String dealerName;

    @Column(name = "dealer_address")
    private String dealerAddress;

    @Column(name = "porsche_code")
    private String porscheCode;

    @Column(name = "car_name")
    private String carName;

    @Column(name = "car_price")
    private Double carPrice;
    
    @Column(name = "base_price")
    private Double basePrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
