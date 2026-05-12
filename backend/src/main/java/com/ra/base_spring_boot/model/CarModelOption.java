package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_model_options", uniqueConstraints = {
        @UniqueConstraint(name = "uk_car_model_option", columnNames = {"car_model_id", "option_item_id"})
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarModelOption
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_item_id", nullable = false)
    private OptionItem optionItem;
}
