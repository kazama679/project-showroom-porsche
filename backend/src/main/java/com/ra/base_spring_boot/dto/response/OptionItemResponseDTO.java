package com.ra.base_spring_boot.dto.response;

import com.ra.base_spring_boot.entity.OptionItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class OptionItemResponseDTO
{
    private Long id;
    private Long optionGroupId;
    private String optionGroupName;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String visualType;
    private String colorHex;
    private String materialTarget;
    private String meshName;
    private String textureUrl;
    private String model3dVariantUrl;

    public static OptionItemResponseDTO fromEntity(OptionItem entity)
    {
        return OptionItemResponseDTO.builder()
            .id(entity.getId())
            .optionGroupId(entity.getOptionGroup() != null ? entity.getOptionGroup().getId() : null)
            .optionGroupName(entity.getOptionGroup() != null ? entity.getOptionGroup().getName() : null)
            .name(entity.getName())
            .description(entity.getDescription())
            .price(entity.getPrice())
            .imageUrl(entity.getImageUrl())
            .visualType(entity.getVisualType())
            .colorHex(entity.getColorHex())
            .materialTarget(entity.getMaterialTarget())
            .meshName(entity.getMeshName())
            .textureUrl(entity.getTextureUrl())
            .model3dVariantUrl(entity.getModel3dVariantUrl())
            .build();
    }
}
