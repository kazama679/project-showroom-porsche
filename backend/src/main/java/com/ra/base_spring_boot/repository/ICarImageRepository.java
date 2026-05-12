package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.CarImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ICarImageRepository extends JpaRepository<CarImage, Long>
{
    Page<CarImage> findByImageTypeContainingIgnoreCase(String keyword, Pageable pageable);
}
