package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ra.base_spring_boot.dto.request.FormBrands;

public interface IBrandService
{
    Page<Brand> findAll(String keyword, Pageable pageable);

    Brand findById(Long id);

    Brand create(FormBrands brand);

    Brand update(Long id, FormBrands brand);

    void delete(Long id);
}