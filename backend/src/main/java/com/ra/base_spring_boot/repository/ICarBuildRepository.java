package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.CarBuild;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ICarBuildRepository extends JpaRepository<CarBuild, Long> {
    @EntityGraph(attributePaths = {"carModel"})
    List<CarBuild> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<CarBuild> findByPorscheCode(String porscheCode);
}
