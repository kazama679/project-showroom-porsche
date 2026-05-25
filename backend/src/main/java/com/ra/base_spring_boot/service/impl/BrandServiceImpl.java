package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.common.exception.HttpConflict;
import com.ra.base_spring_boot.common.exception.HttpNotFound;
import com.ra.base_spring_boot.entity.Brand;
import com.ra.base_spring_boot.repository.IBrandRepository;
import com.ra.base_spring_boot.service.IBrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ra.base_spring_boot.dto.request.FormBrands;
import com.ra.base_spring_boot.service.ICloudinaryService;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements IBrandService
{
    private final IBrandRepository brandRepository;
    private final ICloudinaryService cloudinaryService;

    @Override
    public Page<Brand> findAll(String keyword, Pageable pageable)
    {
        if (keyword == null || keyword.trim().isEmpty())
        {
            return brandRepository.findAll(pageable);
        }

        return brandRepository.findByNameContainingIgnoreCase(keyword, pageable);
    }

    @Override
    public Brand findById(Long id)
    {
        return brandRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Brand not found with id: " + id));
    }

    @Override
    @Transactional
    public Brand create(FormBrands brand)
    {
        boolean exists = brandRepository.findAll()
                .stream()
                .anyMatch(b ->
                        b.getName().equalsIgnoreCase(brand.getName()));

        if (exists)
        {
            throw new HttpConflict("Brand name already exists");
        }

        String logoUrl = null;
        if (brand.getLogo() != null && !brand.getLogo().isEmpty()) {
            logoUrl = cloudinaryService.uploadFile(brand.getLogo());
        }

        Brand entity = Brand.builder()
                .name(brand.getName())
                .country(brand.getCountry())
                .logoUrl(logoUrl)
                .build();

        return brandRepository.save(entity);
    }

    @Override
    @Transactional
    public Brand update(Long id, FormBrands brand)
    {
        Brand oldBrand = brandRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Brand not found with id: " + id));

        boolean exists = brandRepository.findAll()
                .stream()
                .anyMatch(b ->
                        !b.getId().equals(id)
                                && b.getName().equalsIgnoreCase(brand.getName()));

        if (exists)
        {
            throw new HttpConflict("Brand name already exists");
        }

        oldBrand.setName(brand.getName());
        oldBrand.setCountry(brand.getCountry());
        
        if (brand.getLogo() != null && !brand.getLogo().isEmpty()) {
            oldBrand.setLogoUrl(cloudinaryService.uploadFile(brand.getLogo()));
        }

        return brandRepository.save(oldBrand);
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Brand not found with id: " + id));

        brandRepository.delete(brand);
    }
}