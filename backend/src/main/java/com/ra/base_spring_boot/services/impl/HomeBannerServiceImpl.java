package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormHomeBanner;
import com.ra.base_spring_boot.dto.resp.HomeBannerResponseDTO;
import com.ra.base_spring_boot.exception.HttpNotFound;
import com.ra.base_spring_boot.model.CarModel;
import com.ra.base_spring_boot.model.HomeBanner;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.repository.IHomeBannerRepository;
import com.ra.base_spring_boot.services.IHomeBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeBannerServiceImpl implements IHomeBannerService {

    private final IHomeBannerRepository homeBannerRepository;
    private final ICarModelRepository carModelRepository;

    @Override
    public Page<HomeBannerResponseDTO> findAll(String keyword, String type, Pageable pageable) {
        Page<HomeBanner> page;
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasType = type != null && !type.trim().isEmpty();

        if (hasType) {
            if (hasKeyword) {
                page = homeBannerRepository.findByTypeAndTitleContainingIgnoreCase(type, keyword, pageable);
            } else {
                page = homeBannerRepository.findByTypeAndTitleContainingIgnoreCase(type, "", pageable);
            }
        } else {
            if (hasKeyword) {
                page = homeBannerRepository.findByTitleContainingIgnoreCase(keyword, pageable);
            } else {
                page = homeBannerRepository.findAll(pageable);
            }
        }
        return page.map(HomeBannerResponseDTO::fromEntity);
    }

    @Override
    public List<HomeBannerResponseDTO> findActiveByType(String type) {
        List<HomeBanner> list = homeBannerRepository.findByTypeAndIsActiveTrueOrderByDisplayOrderAscIdAsc(type);
        return list.stream().map(HomeBannerResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    public HomeBannerResponseDTO findById(Long id) {
        HomeBanner entity = homeBannerRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Home banner not found with id: " + id));
        return HomeBannerResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public HomeBannerResponseDTO create(FormHomeBanner form) {
        CarModel carModel = null;
        if (form.getCarModelId() != null) {
            carModel = carModelRepository.findById(form.getCarModelId())
                    .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + form.getCarModelId()));
        }

        HomeBanner entity = HomeBanner.builder()
                .carModel(carModel)
                .title(form.getTitle())
                .type(form.getType() != null ? form.getType() : "CARD")
                .videoUrl(form.getVideoUrl())
                .imageUrl(form.getImageUrl())
                .displayOrder(form.getDisplayOrder() != null ? form.getDisplayOrder() : 0)
                .isActive(form.getIsActive() != null ? form.getIsActive() : true)
                .build();

        return HomeBannerResponseDTO.fromEntity(homeBannerRepository.save(entity));
    }

    @Override
    @Transactional
    public HomeBannerResponseDTO update(Long id, FormHomeBanner form) {
        HomeBanner entity = homeBannerRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Home banner not found with id: " + id));

        CarModel carModel = null;
        if (form.getCarModelId() != null) {
            carModel = carModelRepository.findById(form.getCarModelId())
                    .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + form.getCarModelId()));
        }

        entity.setCarModel(carModel);
        entity.setTitle(form.getTitle());
        entity.setType(form.getType());
        entity.setVideoUrl(form.getVideoUrl());
        entity.setImageUrl(form.getImageUrl());
        entity.setDisplayOrder(form.getDisplayOrder());
        entity.setIsActive(form.getIsActive());

        return HomeBannerResponseDTO.fromEntity(homeBannerRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        HomeBanner entity = homeBannerRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Home banner not found with id: " + id));
        homeBannerRepository.delete(entity);
    }
}
