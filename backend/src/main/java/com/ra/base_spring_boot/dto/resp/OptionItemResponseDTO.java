package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.OptionItem;
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
            .build();
    }
}
