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
public class CarEngineSpecDTO {
    private Long id;
    private Long carModelId;
    private String engineType;
    private String drivetrain;
    private BigDecimal fuelConsumption;
}
