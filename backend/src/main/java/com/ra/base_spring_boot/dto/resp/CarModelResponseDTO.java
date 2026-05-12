package com.ra.base_spring_boot.dto.resp;

import com.ra.base_spring_boot.model.CarModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CarModelResponseDTO
{
    private Long id;
    private String name;
    private Integer year;
    private BigDecimal basePrice;
    private String shortDescription;
    private String fuelType;
    private String transmission;
    private Integer seats;
    private Boolean isActive;
    private Long seriesId;
    private String seriesName;
    private Long bodyTypeId;
    private String bodyTypeName;
    private String imageUrl;

    public static CarModelResponseDTO fromEntity(CarModel entity)
    {
        return CarModelResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .year(entity.getYear())
                .basePrice(entity.getBasePrice())
                .shortDescription(entity.getShortDescription())
                .fuelType(entity.getFuelType())
                .transmission(entity.getTransmission())
                .seats(entity.getSeats())
                .isActive(entity.getIsActive())
                .seriesId(entity.getSeries() != null ? entity.getSeries().getId() : null)
                .seriesName(entity.getSeries() != null ? entity.getSeries().getName() : null)
                .bodyTypeId(entity.getBodyType() != null ? entity.getBodyType().getId() : null)
                .bodyTypeName(entity.getBodyType() != null ? entity.getBodyType().getName() : null)
                .imageUrl(entity.getImages() != null ? entity.getImages().stream()
                        .filter(img -> "list".equalsIgnoreCase(img.getImageType()))
                        .findFirst()
                        .map(com.ra.base_spring_boot.model.CarImage::getImageUrl)
                        .orElse(null) : null)
                .build();
    }
}
