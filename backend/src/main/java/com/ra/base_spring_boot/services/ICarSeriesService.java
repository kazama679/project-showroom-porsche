package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormCarSeries;
import com.ra.base_spring_boot.dto.resp.CarSeriesResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICarSeriesService
{
    Page<CarSeriesResponseDTO> findAll(String keyword, Pageable pageable);

    CarSeriesResponseDTO findById(Long id);

    CarSeriesResponseDTO create(FormCarSeries form);

    CarSeriesResponseDTO update(Long id, FormCarSeries form);

    void delete(Long id);
}
