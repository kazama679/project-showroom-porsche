package com.ra.base_spring_boot.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ConfiguratorResponseDTO
{
    private Long id;
    private String name;
    private Integer year;
    private BigDecimal basePrice;
    private BigDecimal deliveryFee;
    private String imageUrl;
    private List<ConfiguratorSectionDTO> sections;
    private List<ConfiguratorGalleryImageDTO> galleryImages;
    private Map<String, String> defaultSelections;
}
