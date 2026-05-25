package com.ra.base_spring_boot.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CarSpecsDTO {
    private CarPerformanceSpecDTO performance;
    private CarEngineSpecDTO engine;
    private CarElectricSpecDTO electric;
}
