package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.OptionGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IOptionGroupRepository extends JpaRepository<OptionGroup, Long>
{
    @Query("SELECT og FROM OptionGroup og JOIN FETCH og.category WHERE LOWER(og.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(og.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<OptionGroup> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
