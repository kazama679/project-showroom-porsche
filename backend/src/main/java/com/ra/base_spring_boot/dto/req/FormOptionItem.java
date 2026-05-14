package com.ra.base_spring_boot.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormOptionItem
{
    private Long optionGroupId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Boolean isDefault;
}
