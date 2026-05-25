package com.ra.base_spring_boot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormCarSeries
{
    private String name;
    private String description;
    private Boolean isActive;
    private Long brandId;
    private org.springframework.web.multipart.MultipartFile image;
    private org.springframework.web.multipart.MultipartFile video;
}
