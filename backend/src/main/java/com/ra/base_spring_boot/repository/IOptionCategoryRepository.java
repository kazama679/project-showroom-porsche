package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.OptionCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IOptionCategoryRepository extends JpaRepository<OptionCategory, Long>
{
    Page<OptionCategory> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
