package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormCarImage;
import com.ra.base_spring_boot.dto.resp.CarImageResponseDTO;
import com.ra.base_spring_boot.services.ICarImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/car-images")
@RequiredArgsConstructor
public class CarImageController
{
    private final ICarImageService carImageService;

    /**
     * @apiNote get all car images (public)
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    )
    {
        Pageable pageable = PageRequest.of(page, size);
        Page<CarImageResponseDTO> images = carImageService.findAll(keyword, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(images)
                        .build()
        );
    }

    /**
     * @apiNote find car image by id (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(carImageService.findById(id))
                        .build()
        );
    }

    /**
     * @apiNote create new car image (ADMIN only)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@ModelAttribute FormCarImage form)
    {
        CarImageResponseDTO created = carImageService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/car-images")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(created)
                        .build()
        );
    }

    /**
     * @apiNote update car image by id (ADMIN only)
     */
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @ModelAttribute FormCarImage form
    )
    {
        CarImageResponseDTO updated = carImageService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }

    /**
     * @apiNote delete car image by id (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id)
    {
        carImageService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete car image successfully")
                        .build()
        );
    }
}
