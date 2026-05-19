package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormHomeBanner;
import com.ra.base_spring_boot.dto.resp.HomeBannerResponseDTO;
import com.ra.base_spring_boot.services.IHomeBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/home-banners")
@RequiredArgsConstructor
public class HomeBannerController {

    private final IHomeBannerService homeBannerService;

    /**
     * @apiNote get all home banners (public / admin view list)
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HomeBannerResponseDTO> banners = homeBannerService.findAll(keyword, type, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(banners)
                        .build()
        );
    }

    /**
     * @apiNote get active home banners by type (public)
     */
    @GetMapping("/active")
    public ResponseEntity<?> findActiveByType(@RequestParam String type) {
        List<HomeBannerResponseDTO> banners = homeBannerService.findActiveByType(type);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(banners)
                        .build()
        );
    }

    /**
     * @apiNote find home banner by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(homeBannerService.findById(id))
                        .build()
        );
    }

    /**
     * @apiNote create new home banner (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody FormHomeBanner form) {
        HomeBannerResponseDTO created = homeBannerService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/home-banners")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(created)
                        .build()
        );
    }

    /**
     * @apiNote update home banner by id (ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody FormHomeBanner form
    ) {
        HomeBannerResponseDTO updated = homeBannerService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }

    /**
     * @apiNote delete home banner by id (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        homeBannerService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete home banner successfully")
                        .build()
        );
    }
}
