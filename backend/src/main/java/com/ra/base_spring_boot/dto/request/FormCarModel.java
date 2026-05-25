package com.ra.base_spring_boot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class FormCarModel
{
    private String name;
    private Integer year;
    private BigDecimal basePrice;
    private String shortDescription;
    private String fuelType;
    private String transmission;
    private Integer seats;
    private Boolean isActive;
    private Long seriesId;
    private Long bodyTypeId;
}
