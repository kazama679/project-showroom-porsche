package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Review extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "status", length = 50)
    private String status;
}
