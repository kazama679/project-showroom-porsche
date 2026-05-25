package com.ra.base_spring_boot.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "option_categories")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class OptionCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "display_order")
    private Integer displayOrder;
}
