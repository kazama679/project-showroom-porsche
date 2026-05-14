package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.OptionGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class OptionGroupResponseDTO
{
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private Integer displayOrder;

    public static OptionGroupResponseDTO fromEntity(OptionGroup entity)
    {
        return OptionGroupResponseDTO.builder()
            .id(entity.getId())
            .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
            .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
            .name(entity.getName())
            .displayOrder(entity.getDisplayOrder())
            .build();
    }
}
