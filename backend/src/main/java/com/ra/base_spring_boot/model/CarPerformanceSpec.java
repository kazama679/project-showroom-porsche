package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "car_performance_specs")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarPerformanceSpec extends BaseCreatedObject
{
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false, unique = true)
    private CarModel carModel;

    @Column(name = "horsepower")
    private Integer horsepower;

    @Column(name = "acceleration_0_100", precision = 5, scale = 2)
    private BigDecimal acceleration0100;

    @Column(name = "top_speed")
    private Integer topSpeed;
}
