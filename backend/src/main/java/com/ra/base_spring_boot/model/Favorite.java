package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(name = "uk_favorite_user_model", columnNames = {"user_id", "car_model_id"})
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Favorite extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;
}
