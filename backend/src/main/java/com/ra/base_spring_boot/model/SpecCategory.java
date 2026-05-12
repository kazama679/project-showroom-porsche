package com.ra.base_spring_boot.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "spec_categories")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class SpecCategory
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "display_order")
    private Integer displayOrder;
}
