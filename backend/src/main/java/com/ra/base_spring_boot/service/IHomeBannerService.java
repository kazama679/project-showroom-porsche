package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.FormHomeBanner;
import com.ra.base_spring_boot.dto.response.HomeBannerResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IHomeBannerService {
    Page<HomeBannerResponseDTO> findAll(String keyword, String type, Pageable pageable);
    
    List<HomeBannerResponseDTO> findActiveByType(String type);

    HomeBannerResponseDTO findById(Long id);

    HomeBannerResponseDTO create(FormHomeBanner form);

    HomeBannerResponseDTO update(Long id, FormHomeBanner form);

    void delete(Long id);
}
