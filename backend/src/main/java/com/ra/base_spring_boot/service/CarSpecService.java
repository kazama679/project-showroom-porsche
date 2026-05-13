package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.req.CarSpecsDTO;

public interface CarSpecService {
    CarSpecsDTO getSpecsByCarModelId(Long carModelId);
    CarSpecsDTO saveSpecs(Long carModelId, CarSpecsDTO specsDTO);
}
