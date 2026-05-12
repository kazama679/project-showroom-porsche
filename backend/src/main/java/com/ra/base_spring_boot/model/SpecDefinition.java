package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "spec_definitions")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SpecDefinition
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private SpecCategory category;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "display_order")
    private Integer displayOrder;
}
