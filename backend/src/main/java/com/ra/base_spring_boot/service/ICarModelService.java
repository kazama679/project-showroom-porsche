package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.FormCarModel;
import com.ra.base_spring_boot.dto.response.CarModelResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICarModelService
{
    Page<CarModelResponseDTO> findAll(String keyword, Long seriesId, Pageable pageable);

    CarModelResponseDTO findById(Long id);

    CarModelResponseDTO create(FormCarModel form);

    CarModelResponseDTO update(Long id, FormCarModel form);

    void delete(Long id);
}
