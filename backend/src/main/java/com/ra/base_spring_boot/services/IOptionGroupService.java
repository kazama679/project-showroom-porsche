package com.ra.base_spring_boot.services;

import com.ra.base_spring_boot.dto.req.FormOptionGroup;
import com.ra.base_spring_boot.dto.resp.OptionGroupResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IOptionGroupService
{
    Page<OptionGroupResponseDTO> findAll(String keyword, Pageable pageable);

    OptionGroupResponseDTO findById(Long id);

    OptionGroupResponseDTO create(FormOptionGroup form);

    OptionGroupResponseDTO update(Long id, FormOptionGroup form);

    void delete(Long id);
}
