package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_images")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarImage extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_type", nullable = false, length = 50)
    private String imageType;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_default")
    private Boolean isDefault;
}
