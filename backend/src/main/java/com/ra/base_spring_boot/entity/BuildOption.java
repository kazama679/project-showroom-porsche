package com.ra.base_spring_boot.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "build_options")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BuildOption
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "build_id", nullable = false)
    private CarBuild build;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_item_id", nullable = false)
    private OptionItem optionItem;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
}
