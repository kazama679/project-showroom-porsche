package com.ra.base_spring_boot.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormCarImage
{
    private org.springframework.web.multipart.MultipartFile image;
    private String imageType;
    private Integer sortOrder;
    private Boolean isDefault;
    private Long carModelId;
}
