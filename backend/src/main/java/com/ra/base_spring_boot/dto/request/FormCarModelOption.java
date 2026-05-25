package com.ra.base_spring_boot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormCarModelOption
{
    private Long carModelId;
    private Long optionItemId;
    private Boolean isDefault;
}
