package com.ra.base_spring_boot.dto.response;

import com.ra.base_spring_boot.entity.OptionGroup;
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
    private String selectionType;

    public static OptionGroupResponseDTO fromEntity(OptionGroup entity)
    {
        return OptionGroupResponseDTO.builder()
            .id(entity.getId())
            .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
            .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
            .name(entity.getName())
            .displayOrder(entity.getDisplayOrder())
            .selectionType(entity.getSelectionType())
            .build();
    }
}
