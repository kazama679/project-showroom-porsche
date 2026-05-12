package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBrandRepository extends JpaRepository<Brand, Long>
{
    Page<Brand> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}