package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.resp.ConfiguratorResponseDTO;

public interface IConfiguratorService
{
    ConfiguratorResponseDTO getByCarModelId(Long carModelId);
}
