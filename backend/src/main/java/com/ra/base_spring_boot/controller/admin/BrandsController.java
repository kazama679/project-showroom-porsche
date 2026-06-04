package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.response.PageResponse;
import com.ra.base_spring_boot.entity.Brand;
import com.ra.base_spring_boot.service.IBrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ra.base_spring_boot.dto.request.FormBrands;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandsController
{
    private final IBrandService brandService;

    /**
     * @apiNote get all brands (public - no auth required)
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "5") Integer size
    )
    {
        Pageable pageable = PageRequest.of(page, size);

        Page<Brand> brands = brandService.findAll(keyword, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(PageResponse.from(brands))
                        .build()
        );
    }

    /**
     * @param id Long
     * @apiNote find brand by id (public - no auth required)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(brandService.findById(id))
                        .build()
        );
    }

    /**
     * @param brand Brand
     * @apiNote create new brand (ADMIN only)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@ModelAttribute FormBrands form)
    {
        brandService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/brands")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data("Create brand successfully")
                        .build()
        );
    }

    /**
     * @param id Long
     * @param brand Brand
     * @apiNote update brand by id (ADMIN only)
     */
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @ModelAttribute FormBrands form
    )
    {
        brandService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Update brand successfully")
                        .build()
        );
    }

    /**
     * @param id Long
     * @apiNote delete brand by id (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id)
    {
        brandService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete brand successfully")
                        .build()
        );
    }
}
