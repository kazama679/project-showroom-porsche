package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "option_groups")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class OptionGroup
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private OptionCategory category;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "display_order")
    private Integer displayOrder;
}
