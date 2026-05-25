package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.OptionRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IOptionRuleRepository extends JpaRepository<OptionRule, Long>
{
    @Query("SELECT oru FROM OptionRule oru JOIN FETCH oru.sourceOption JOIN FETCH oru.targetOption WHERE LOWER(oru.sourceOption.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(oru.targetOption.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(oru.ruleType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<OptionRule> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
