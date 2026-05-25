package com.ra.base_spring_boot.dto.response;

import com.ra.base_spring_boot.entity.HomeBanner;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class HomeBannerResponseDTO {
    private Long id;
    private Long carModelId;
    private String carModelName;
    private String title;
    private String type;
    private String videoUrl;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean isActive;

    public static HomeBannerResponseDTO fromEntity(HomeBanner entity) {
        if (entity == null) return null;
        return HomeBannerResponseDTO.builder()
                .id(entity.getId())
                .carModelId(entity.getCarModel() != null ? entity.getCarModel().getId() : null)
                .carModelName(entity.getCarModel() != null ? entity.getCarModel().getName() : null)
                .title(entity.getTitle())
                .type(entity.getType())
                .videoUrl(entity.getVideoUrl())
                .imageUrl(entity.getImageUrl())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .build();
    }
}
