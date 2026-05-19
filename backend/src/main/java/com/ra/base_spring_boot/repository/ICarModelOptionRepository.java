package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.CarModelOption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ICarModelOptionRepository extends JpaRepository<CarModelOption, Long>
{
    @Query("SELECT cmo FROM CarModelOption cmo JOIN FETCH cmo.carModel JOIN FETCH cmo.optionItem WHERE LOWER(cmo.carModel.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(cmo.optionItem.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<CarModelOption> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query(
            value = """
                    SELECT cmo FROM CarModelOption cmo
                    JOIN cmo.optionItem oi
                    WHERE cmo.carModel.id = :carModelId
                    AND (:keyword = '' OR LOWER(oi.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """,
            countQuery = """
                    SELECT COUNT(cmo) FROM CarModelOption cmo
                    JOIN cmo.optionItem oi
                    WHERE cmo.carModel.id = :carModelId
                    AND (:keyword = '' OR LOWER(oi.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """
    )
    Page<CarModelOption> findByCarModelIdAndKeyword(
            @Param("carModelId") Long carModelId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
            SELECT cmo FROM CarModelOption cmo
            JOIN FETCH cmo.optionItem oi
            JOIN FETCH oi.optionGroup og
            JOIN FETCH og.category
            WHERE cmo.carModel.id = :carModelId
            ORDER BY og.category.displayOrder, og.displayOrder, oi.name
            """)
    List<CarModelOption> findByCarModelIdWithDetails(@Param("carModelId") Long carModelId);
}
