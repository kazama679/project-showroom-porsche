package com.ra.base_spring_boot.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormHomeBanner {
    private Long carModelId;
    private String title;
    private String type;
    private String videoUrl;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean isActive;
}
