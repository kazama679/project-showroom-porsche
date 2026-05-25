package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.FormOptionRule;
import com.ra.base_spring_boot.dto.response.OptionRuleResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IOptionRuleService
{
    Page<OptionRuleResponseDTO> findAll(String keyword, Pageable pageable);

    OptionRuleResponseDTO findById(Long id);

    OptionRuleResponseDTO create(FormOptionRule form);

    OptionRuleResponseDTO update(Long id, FormOptionRule form);

    void delete(Long id);
}
