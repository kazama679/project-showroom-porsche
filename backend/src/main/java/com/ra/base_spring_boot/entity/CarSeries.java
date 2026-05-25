package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_series", indexes = @Index(name = "idx_series_brand", columnList = "brand_id"))
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarSeries extends BaseObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "video_url")
    private String videoUrl;
}
