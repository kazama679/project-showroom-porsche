package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "car_electric_specs")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarElectricSpec extends BaseCreatedObject
{
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false, unique = true)
    private CarModel carModel;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "battery_capacity", precision = 6, scale = 2)
    private BigDecimal batteryCapacity;

    @Column(name = "charging_time", precision = 5, scale = 2)
    private BigDecimal chargingTime;
}
