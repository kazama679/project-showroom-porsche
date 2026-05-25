package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.FormOptionCategory;
import com.ra.base_spring_boot.dto.response.OptionCategoryResponseDTO;
import com.ra.base_spring_boot.common.exception.HttpConflict;
import com.ra.base_spring_boot.common.exception.HttpNotFound;
import com.ra.base_spring_boot.entity.OptionCategory;
import com.ra.base_spring_boot.repository.IOptionCategoryRepository;
import com.ra.base_spring_boot.service.IOptionCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OptionCategoryServiceImpl implements IOptionCategoryService
{
    private final IOptionCategoryRepository optionCategoryRepository;

    @Override
    public Page<OptionCategoryResponseDTO> findAll(String keyword, Pageable pageable)
    {
        Page<OptionCategory> page;
        if (keyword == null || keyword.trim().isEmpty())
        {
            page = optionCategoryRepository.findAll(pageable);
        }
        else
        {
            page = optionCategoryRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }
        return page.map(OptionCategoryResponseDTO::fromEntity);
    }

    @Override
    public OptionCategoryResponseDTO findById(Long id)
    {
        OptionCategory entity = optionCategoryRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Option category not found with id: " + id));
        return OptionCategoryResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public OptionCategoryResponseDTO create(FormOptionCategory form)
    {
        boolean exists = optionCategoryRepository.findAll()
                .stream()
                .anyMatch(o ->
                        o.getName().equalsIgnoreCase(form.getName()));

        if (exists)
        {
            throw new HttpConflict("Option category name already exists");
        }

        OptionCategory entity = OptionCategory.builder()
                .name(form.getName())
                .displayOrder(form.getDisplayOrder())
                .build();

        return OptionCategoryResponseDTO.fromEntity(optionCategoryRepository.save(entity));
    }

    @Override
    @Transactional
    public OptionCategoryResponseDTO update(Long id, FormOptionCategory form)
    {
        OptionCategory oldCategory = optionCategoryRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Option category not found with id: " + id));

        boolean exists = optionCategoryRepository.findAll()
                .stream()
                .anyMatch(o ->
                        !o.getId().equals(id)
                                && o.getName().equalsIgnoreCase(form.getName()));

        if (exists)
        {
            throw new HttpConflict("Option category name already exists");
        }

        oldCategory.setName(form.getName());
        oldCategory.setDisplayOrder(form.getDisplayOrder());

        return OptionCategoryResponseDTO.fromEntity(optionCategoryRepository.save(oldCategory));
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        OptionCategory optionCategory = optionCategoryRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Option category not found with id: " + id));

        optionCategoryRepository.delete(optionCategory);
    }
}
