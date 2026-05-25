package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.CarEngineSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarEngineSpecRepository extends JpaRepository<CarEngineSpec, Long> {
    Optional<CarEngineSpec> findByCarModelId(Long carModelId);
}
