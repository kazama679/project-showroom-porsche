package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.FormCarModelOption;
import com.ra.base_spring_boot.dto.response.CarModelOptionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICarModelOptionService
{
    Page<CarModelOptionResponseDTO> findAll(String keyword, Long carModelId, Pageable pageable);

    Page<CarModelOptionResponseDTO> findByCarModelId(Long carModelId, String keyword, Pageable pageable);

    CarModelOptionResponseDTO findById(Long id);

    CarModelOptionResponseDTO create(FormCarModelOption form);

    CarModelOptionResponseDTO update(Long id, FormCarModelOption form);

    void delete(Long id);
}
