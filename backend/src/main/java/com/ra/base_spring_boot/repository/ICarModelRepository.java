package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.CarModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ICarModelRepository extends JpaRepository<CarModel, Long>
{
    Page<CarModel> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    Page<CarModel> findBySeries_Id(Long seriesId, Pageable pageable);
    Page<CarModel> findBySeries_IdAndNameContainingIgnoreCase(Long seriesId, String keyword, Pageable pageable);
}
