package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "car_engine_specs")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarEngineSpec extends BaseCreatedObject
{
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false, unique = true)
    private CarModel carModel;

    @Column(name = "engine_type", length = 50)
    private String engineType;

    @Column(name = "drivetrain", length = 50)
    private String drivetrain;

    @Column(name = "fuel_consumption", precision = 5, scale = 2)
    private BigDecimal fuelConsumption;
}
