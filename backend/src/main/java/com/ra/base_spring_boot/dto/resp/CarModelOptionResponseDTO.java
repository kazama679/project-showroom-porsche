package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.CarModelOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CarModelOptionResponseDTO
{
    private Long id;
    private Long carModelId;
    private String carModelName;
    private Long optionItemId;
    private String optionItemName;
    private Boolean isDefault;

    public static CarModelOptionResponseDTO fromEntity(CarModelOption entity)
    {
        return CarModelOptionResponseDTO.builder()
            .id(entity.getId())
            .carModelId(entity.getCarModel() != null ? entity.getCarModel().getId() : null)
            .carModelName(entity.getCarModel() != null ? entity.getCarModel().getName() : null)
            .optionItemId(entity.getOptionItem() != null ? entity.getOptionItem().getId() : null)
            .optionItemName(entity.getOptionItem() != null ? entity.getOptionItem().getName() : null)
            .isDefault(entity.getIsDefault())
            .build();
    }
}
