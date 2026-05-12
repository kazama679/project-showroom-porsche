package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormOptionCategory;
import com.ra.base_spring_boot.dto.resp.OptionCategoryResponseDTO;
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
