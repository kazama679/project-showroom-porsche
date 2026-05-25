package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "car_models", indexes = {
        @Index(name = "idx_model_series", columnList = "series_id"),
        @Index(name = "idx_model_body", columnList = "body_type_id"),
        @Index(name = "idx_model_price", columnList = "base_price")
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarModel extends BaseObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private CarSeries series;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "body_type_id", nullable = false)
    private BodyType bodyType;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "fuel_type", length = 50)
    private String fuelType;

    @Column(name = "transmission", length = 50)
    private String transmission;

    @Column(name = "seats")
    private Integer seats;

    @Column(name = "is_active")
    private Boolean isActive;

    @OneToMany(mappedBy = "carModel", fetch = FetchType.LAZY)
    private List<CarImage> images;
}
