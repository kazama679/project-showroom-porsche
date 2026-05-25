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
public class CarPerformanceSpecDTO {
    private Long id;
    private Long carModelId;
    private Integer horsepower;
    private BigDecimal acceleration0100;
    private Integer topSpeed;
}
