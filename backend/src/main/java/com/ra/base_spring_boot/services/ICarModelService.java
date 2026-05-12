package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormCarModel;
import com.ra.base_spring_boot.dto.resp.CarModelResponseDTO;
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
