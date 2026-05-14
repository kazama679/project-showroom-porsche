package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.OptionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IOptionItemRepository extends JpaRepository<OptionItem, Long>
{
    @Query("SELECT oi FROM OptionItem oi JOIN FETCH oi.optionGroup WHERE LOWER(oi.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(oi.optionGroup.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<OptionItem> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
