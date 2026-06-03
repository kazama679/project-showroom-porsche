package com.ra.base_spring_boot.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "option_items")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class OptionItem
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id", nullable = false)
    private OptionGroup optionGroup;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "visual_type", length = 50)
    private String visualType;

    @Column(name = "color_hex", length = 20)
    private String colorHex;

    @Column(name = "material_target", length = 100)
    private String materialTarget;

    @Column(name = "mesh_name", length = 150)
    private String meshName;

    @Column(name = "texture_url", length = 500)
    private String textureUrl;

    @Column(name = "model_3d_variant_url", length = 500)
    private String model3dVariantUrl;

}
