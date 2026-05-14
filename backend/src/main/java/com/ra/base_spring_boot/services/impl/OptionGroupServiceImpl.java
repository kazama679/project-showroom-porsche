package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormOptionGroup;
import com.ra.base_spring_boot.dto.resp.OptionGroupResponseDTO;
import com.ra.base_spring_boot.exception.HttpConflict;
import com.ra.base_spring_boot.exception.HttpNotFound;
import com.ra.base_spring_boot.model.OptionCategory;
import com.ra.base_spring_boot.model.OptionGroup;
import com.ra.base_spring_boot.repository.IOptionCategoryRepository;
import com.ra.base_spring_boot.repository.IOptionGroupRepository;
import com.ra.base_spring_boot.services.IOptionGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OptionGroupServiceImpl implements IOptionGroupService
{
    private final IOptionGroupRepository optionGroupRepository;
    private final IOptionCategoryRepository optionCategoryRepository;

    @Override
    public Page<OptionGroupResponseDTO> findAll(String keyword, Pageable pageable)
    {
        Page<OptionGroup> page;
        if (keyword == null || keyword.trim().isEmpty())
        {
            page = optionGroupRepository.findAll(pageable);
        }
        else
        {
            page = optionGroupRepository.findByKeyword(keyword, pageable);
        }
        return page.map(OptionGroupResponseDTO::fromEntity);
    }

    @Override
    public OptionGroupResponseDTO findById(Long id)
    {
        OptionGroup entity = optionGroupRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option group not found with id: " + id));
        return OptionGroupResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public OptionGroupResponseDTO create(FormOptionGroup form)
    {
        OptionCategory category = optionCategoryRepository.findById(form.getCategoryId())
                .orElseThrow(() -> new HttpNotFound("Option category not found with id: " + form.getCategoryId()));

        boolean exists = optionGroupRepository.findAll()
                .stream()
                .anyMatch(o -> o.getName().equalsIgnoreCase(form.getName()) && o.getCategory().getId().equals(form.getCategoryId()));

        if (exists)
        {
            throw new HttpConflict("Option group name already exists in this category");
        }

        OptionGroup entity = OptionGroup.builder()
                .category(category)
                .name(form.getName())
                .displayOrder(form.getDisplayOrder())
                .build();

        return OptionGroupResponseDTO.fromEntity(optionGroupRepository.save(entity));
    }

    @Override
    @Transactional
    public OptionGroupResponseDTO update(Long id, FormOptionGroup form)
    {
        OptionGroup oldGroup = optionGroupRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option group not found with id: " + id));

        OptionCategory category = optionCategoryRepository.findById(form.getCategoryId())
                .orElseThrow(() -> new HttpNotFound("Option category not found with id: " + form.getCategoryId()));

        boolean exists = optionGroupRepository.findAll()
                .stream()
                .anyMatch(o -> !o.getId().equals(id)
                        && o.getName().equalsIgnoreCase(form.getName())
                        && o.getCategory().getId().equals(form.getCategoryId()));

        if (exists)
        {
            throw new HttpConflict("Option group name already exists in this category");
        }

        oldGroup.setCategory(category);
        oldGroup.setName(form.getName());
        oldGroup.setDisplayOrder(form.getDisplayOrder());

        return OptionGroupResponseDTO.fromEntity(optionGroupRepository.save(oldGroup));
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        OptionGroup optionGroup = optionGroupRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option group not found with id: " + id));

        optionGroupRepository.delete(optionGroup);
    }
}
