package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.response.ConfiguratorResponseDTO;

public interface IConfiguratorService
{
    ConfiguratorResponseDTO getByCarModelId(Long carModelId);
}
