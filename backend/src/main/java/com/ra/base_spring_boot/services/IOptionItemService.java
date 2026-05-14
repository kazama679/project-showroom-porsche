package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormOptionItem;
import com.ra.base_spring_boot.dto.resp.OptionItemResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IOptionItemService
{
    Page<OptionItemResponseDTO> findAll(String keyword, Pageable pageable);

    OptionItemResponseDTO findById(Long id);

    OptionItemResponseDTO create(FormOptionItem form);

    OptionItemResponseDTO update(Long id, FormOptionItem form);

    void delete(Long id);
}
