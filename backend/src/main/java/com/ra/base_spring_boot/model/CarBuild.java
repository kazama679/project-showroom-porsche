package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

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
    @JoinColumn(name = "user_id", nullable = false)
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
}
