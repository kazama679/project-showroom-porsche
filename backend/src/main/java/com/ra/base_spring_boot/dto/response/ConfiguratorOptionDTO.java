package com.ra.base_spring_boot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ConfiguratorOptionDTO
{
    private String id;
    private String code;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean isStandard;
    private String imageUrl;
    private String color;
    private String visualType;
    private String colorHex;
    private String materialTarget;
    private String meshName;
    private String textureUrl;
    private String model3dVariantUrl;
}
