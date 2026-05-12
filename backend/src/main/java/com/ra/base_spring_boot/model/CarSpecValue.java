package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_spec_values", uniqueConstraints = {
        @UniqueConstraint(name = "uk_car_spec_value", columnNames = {"car_model_id", "spec_definition_id"})
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarSpecValue
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_definition_id", nullable = false)
    private SpecDefinition specDefinition;

    @Column(name = "value", nullable = false, length = 100)
    private String value;
}
