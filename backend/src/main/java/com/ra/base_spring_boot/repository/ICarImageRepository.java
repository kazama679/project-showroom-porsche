package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.CarImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ICarImageRepository extends JpaRepository<CarImage, Long>
{
    Page<CarImage> findByImageTypeContainingIgnoreCase(String keyword, Pageable pageable);

    List<CarImage> findByCarModelIdOrderBySortOrderAsc(Long carModelId);
}
