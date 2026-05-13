package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.CarPerformanceSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarPerformanceSpecRepository extends JpaRepository<CarPerformanceSpec, Long> {
    Optional<CarPerformanceSpec> findByCarModelId(Long carModelId);
}
