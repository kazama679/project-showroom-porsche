package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ai_recommendations")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class AiRecommendation extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "usage", length = 255)
    private String usage;

    @Column(name = "family_size")
    private Integer familySize;

    @Column(name = "preferred_body", length = 100)
    private String preferredBody;

    @Column(name = "recommendation_result", columnDefinition = "TEXT")
    private String recommendationResult;
}
