package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.FormOptionRule;
import com.ra.base_spring_boot.dto.response.OptionRuleResponseDTO;
import com.ra.base_spring_boot.common.exception.HttpConflict;
import com.ra.base_spring_boot.common.exception.HttpNotFound;
import com.ra.base_spring_boot.entity.OptionItem;
import com.ra.base_spring_boot.entity.OptionRule;
import com.ra.base_spring_boot.repository.IOptionItemRepository;
import com.ra.base_spring_boot.repository.IOptionRuleRepository;
import com.ra.base_spring_boot.service.IOptionRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OptionRuleServiceImpl implements IOptionRuleService
{
    private final IOptionRuleRepository optionRuleRepository;
    private final IOptionItemRepository optionItemRepository;

    @Override
    public Page<OptionRuleResponseDTO> findAll(String keyword, Pageable pageable)
    {
        Page<OptionRule> page;
        if (keyword == null || keyword.trim().isEmpty())
        {
            page = optionRuleRepository.findAll(pageable);
        }
        else
        {
            page = optionRuleRepository.findByKeyword(keyword, pageable);
        }
        return page.map(OptionRuleResponseDTO::fromEntity);
    }

    @Override
    public OptionRuleResponseDTO findById(Long id)
    {
        OptionRule entity = optionRuleRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option rule not found with id: " + id));
        return OptionRuleResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public OptionRuleResponseDTO create(FormOptionRule form)
    {
        OptionItem sourceOption = optionItemRepository.findById(form.getSourceOptionId())
                .orElseThrow(() -> new HttpNotFound("Source option not found with id: " + form.getSourceOptionId()));

        OptionItem targetOption = optionItemRepository.findById(form.getTargetOptionId())
                .orElseThrow(() -> new HttpNotFound("Target option not found with id: " + form.getTargetOptionId()));

        if (form.getSourceOptionId().equals(form.getTargetOptionId())) {
            throw new HttpConflict("Source option cannot be the same as target option");
        }

        boolean exists = optionRuleRepository.findAll()
                .stream()
                .anyMatch(o -> o.getSourceOption().getId().equals(form.getSourceOptionId()) 
                            && o.getTargetOption().getId().equals(form.getTargetOptionId())
                            && o.getRuleType().equalsIgnoreCase(form.getRuleType()));

        if (exists)
        {
            throw new HttpConflict("This rule already exists between these options");
        }

        OptionRule entity = OptionRule.builder()
                .sourceOption(sourceOption)
                .targetOption(targetOption)
                .ruleType(form.getRuleType())
                .build();

        return OptionRuleResponseDTO.fromEntity(optionRuleRepository.save(entity));
    }

    @Override
    @Transactional
    public OptionRuleResponseDTO update(Long id, FormOptionRule form)
    {
        OptionRule oldEntity = optionRuleRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option rule not found with id: " + id));

        OptionItem sourceOption = optionItemRepository.findById(form.getSourceOptionId())
                .orElseThrow(() -> new HttpNotFound("Source option not found with id: " + form.getSourceOptionId()));

        OptionItem targetOption = optionItemRepository.findById(form.getTargetOptionId())
                .orElseThrow(() -> new HttpNotFound("Target option not found with id: " + form.getTargetOptionId()));

        if (form.getSourceOptionId().equals(form.getTargetOptionId())) {
            throw new HttpConflict("Source option cannot be the same as target option");
        }

        boolean exists = optionRuleRepository.findAll()
                .stream()
                .anyMatch(o -> !o.getId().equals(id)
                        && o.getSourceOption().getId().equals(form.getSourceOptionId()) 
                        && o.getTargetOption().getId().equals(form.getTargetOptionId())
                        && o.getRuleType().equalsIgnoreCase(form.getRuleType()));

        if (exists)
        {
            throw new HttpConflict("This rule already exists between these options");
        }

        oldEntity.setSourceOption(sourceOption);
        oldEntity.setTargetOption(targetOption);
        oldEntity.setRuleType(form.getRuleType());

        return OptionRuleResponseDTO.fromEntity(optionRuleRepository.save(oldEntity));
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        OptionRule entity = optionRuleRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option rule not found with id: " + id));

        optionRuleRepository.delete(entity);
    }
}
