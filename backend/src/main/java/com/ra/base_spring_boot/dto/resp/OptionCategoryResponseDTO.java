package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.OptionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class OptionCategoryResponseDTO
{
    private Long id;
    private String name;
    private Integer displayOrder;

    public static OptionCategoryResponseDTO fromEntity(OptionCategory entity)
    {
        return OptionCategoryResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }
}
