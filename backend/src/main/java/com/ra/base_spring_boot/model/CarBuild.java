package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "car_builds")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarBuild extends BaseObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "currency", length = 3)
    private String currency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Column(name = "porsche_code", length = 10, unique = true)
    private String porscheCode;

    @Column(name = "color_name", length = 100)
    private String colorName;

    @Column(name = "interior_name", length = 100)
    private String interiorName;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // We can store gallery images as a serialized JSON string for quick fetching
    @Column(name = "gallery_images", columnDefinition = "TEXT")
    private String galleryImages;

    // We can store the frontend specific selections grouping here for easy rehydration
    @Column(name = "selections", columnDefinition = "TEXT")
    private String selections;
}
