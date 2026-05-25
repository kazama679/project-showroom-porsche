package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.FormOptionCategory;
import com.ra.base_spring_boot.dto.response.OptionCategoryResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IOptionCategoryService
{
    Page<OptionCategoryResponseDTO> findAll(String keyword, Pageable pageable);

    OptionCategoryResponseDTO findById(Long id);

    OptionCategoryResponseDTO create(FormOptionCategory form);

    OptionCategoryResponseDTO update(Long id, FormOptionCategory form);

    void delete(Long id);
}
