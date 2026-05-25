package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "home_banners")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class HomeBanner extends BaseObject {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = true)
    private CarModel carModel;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // 'HERO' or 'CARD'

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active")
    private Boolean isActive;
}
