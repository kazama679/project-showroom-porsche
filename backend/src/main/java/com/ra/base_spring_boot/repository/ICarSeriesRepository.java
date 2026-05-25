package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.CarSeries;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ICarSeriesRepository extends JpaRepository<CarSeries, Long>
{
    Page<CarSeries> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
