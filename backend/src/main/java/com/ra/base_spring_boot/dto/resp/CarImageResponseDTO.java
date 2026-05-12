package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.CarImage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CarImageResponseDTO
{
    private Long id;
    private String imageUrl;
    private String imageType;
    private Integer sortOrder;
    private Boolean isDefault;
    private Long carModelId;
    private String carModelName;

    public static CarImageResponseDTO fromEntity(CarImage entity)
    {
        return CarImageResponseDTO.builder()
                .id(entity.getId())
                .imageUrl(entity.getImageUrl())
                .imageType(entity.getImageType())
                .sortOrder(entity.getSortOrder())
                .isDefault(entity.getIsDefault())
                .carModelId(entity.getCarModel() != null ? entity.getCarModel().getId() : null)
                .carModelName(entity.getCarModel() != null ? entity.getCarModel().getName() : null)
                .build();
    }
}
