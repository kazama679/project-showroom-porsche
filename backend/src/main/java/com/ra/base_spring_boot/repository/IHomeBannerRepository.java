package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.HomeBanner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IHomeBannerRepository extends JpaRepository<HomeBanner, Long> {
    List<HomeBanner> findByTypeAndIsActiveTrueOrderByDisplayOrderAscIdAsc(String type);
    Page<HomeBanner> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    Page<HomeBanner> findByTypeAndTitleContainingIgnoreCase(String type, String keyword, Pageable pageable);
}
