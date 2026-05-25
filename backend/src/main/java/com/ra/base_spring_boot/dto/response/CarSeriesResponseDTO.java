package com.ra.base_spring_boot.dto.response;

import com.ra.base_spring_boot.entity.CarSeries;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CarSeriesResponseDTO
{
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private Long brandId;
    private String brandName;
    private String imageUrl;
    private String videoUrl;

    public static CarSeriesResponseDTO fromEntity(CarSeries entity)
    {
        return CarSeriesResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .isActive(entity.getIsActive())
                .brandId(entity.getBrand() != null ? entity.getBrand().getId() : null)
                .brandName(entity.getBrand() != null ? entity.getBrand().getName() : null)
                .imageUrl(entity.getImageUrl())
                .videoUrl(entity.getVideoUrl())
                .build();
    }
}
