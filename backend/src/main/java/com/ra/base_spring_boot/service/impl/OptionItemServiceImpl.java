package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.FormOptionItem;
import com.ra.base_spring_boot.dto.response.OptionItemResponseDTO;
import com.ra.base_spring_boot.common.exception.HttpConflict;
import com.ra.base_spring_boot.common.exception.HttpNotFound;
import com.ra.base_spring_boot.entity.OptionGroup;
import com.ra.base_spring_boot.entity.OptionItem;
import com.ra.base_spring_boot.repository.IOptionGroupRepository;
import com.ra.base_spring_boot.repository.IOptionItemRepository;
import com.ra.base_spring_boot.service.IOptionItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OptionItemServiceImpl implements IOptionItemService
{
    private final IOptionItemRepository optionItemRepository;
    private final IOptionGroupRepository optionGroupRepository;

    @Override
    public Page<OptionItemResponseDTO> findAll(String keyword, Pageable pageable)
    {
        Page<OptionItem> page;
        if (keyword == null || keyword.trim().isEmpty())
        {
            page = optionItemRepository.findAll(pageable);
        }
        else
        {
            page = optionItemRepository.findByKeyword(keyword, pageable);
        }
        return page.map(OptionItemResponseDTO::fromEntity);
    }

    @Override
    public OptionItemResponseDTO findById(Long id)
    {
        OptionItem entity = optionItemRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option item not found with id: " + id));
        return OptionItemResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public OptionItemResponseDTO create(FormOptionItem form)
    {
        OptionGroup group = optionGroupRepository.findById(form.getOptionGroupId())
                .orElseThrow(() -> new HttpNotFound("Option group not found with id: " + form.getOptionGroupId()));

        boolean exists = optionItemRepository.findAll()
                .stream()
                .anyMatch(o -> o.getName().equalsIgnoreCase(form.getName()) && o.getOptionGroup().getId().equals(form.getOptionGroupId()));

        if (exists)
        {
            throw new HttpConflict("Option item name already exists in this group");
        }

        OptionItem entity = OptionItem.builder()
                .optionGroup(group)
                .name(form.getName())
                .description(form.getDescription())
                .price(form.getPrice())
                .imageUrl(form.getImageUrl())
                .visualType(form.getVisualType())
                .colorHex(form.getColorHex())
                .materialTarget(form.getMaterialTarget())
                .meshName(form.getMeshName())
                .textureUrl(form.getTextureUrl())
                .model3dVariantUrl(form.getModel3dVariantUrl())
                .build();

        return OptionItemResponseDTO.fromEntity(optionItemRepository.save(entity));
    }

    @Override
    @Transactional
    public OptionItemResponseDTO update(Long id, FormOptionItem form)
    {
        OptionItem oldItem = optionItemRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option item not found with id: " + id));

        OptionGroup group = optionGroupRepository.findById(form.getOptionGroupId())
                .orElseThrow(() -> new HttpNotFound("Option group not found with id: " + form.getOptionGroupId()));

        boolean exists = optionItemRepository.findAll()
                .stream()
                .anyMatch(o -> !o.getId().equals(id)
                        && o.getName().equalsIgnoreCase(form.getName())
                        && o.getOptionGroup().getId().equals(form.getOptionGroupId()));

        if (exists)
        {
            throw new HttpConflict("Option item name already exists in this group");
        }

        oldItem.setOptionGroup(group);
        oldItem.setName(form.getName());
        oldItem.setDescription(form.getDescription());
        oldItem.setPrice(form.getPrice());
        oldItem.setImageUrl(form.getImageUrl());
        if (hasVisualMetadata(form)) {
            oldItem.setVisualType(form.getVisualType());
            oldItem.setColorHex(form.getColorHex());
            oldItem.setMaterialTarget(form.getMaterialTarget());
            oldItem.setMeshName(form.getMeshName());
            oldItem.setTextureUrl(form.getTextureUrl());
            oldItem.setModel3dVariantUrl(form.getModel3dVariantUrl());
        }

        return OptionItemResponseDTO.fromEntity(optionItemRepository.save(oldItem));
    }

    private boolean hasVisualMetadata(FormOptionItem form)
    {
        return form.getVisualType() != null
                || form.getColorHex() != null
                || form.getMaterialTarget() != null
                || form.getMeshName() != null
                || form.getTextureUrl() != null
                || form.getModel3dVariantUrl() != null;
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        OptionItem optionItem = optionItemRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Option item not found with id: " + id));

        optionItemRepository.delete(optionItem);
    }
}
