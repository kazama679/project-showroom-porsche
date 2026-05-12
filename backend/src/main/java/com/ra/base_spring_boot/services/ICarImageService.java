package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormCarImage;
import com.ra.base_spring_boot.dto.resp.CarImageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICarImageService
{
    Page<CarImageResponseDTO> findAll(String keyword, Pageable pageable);

    CarImageResponseDTO findById(Long id);

    CarImageResponseDTO create(FormCarImage form);

    CarImageResponseDTO update(Long id, FormCarImage form);

    void delete(Long id);
}
