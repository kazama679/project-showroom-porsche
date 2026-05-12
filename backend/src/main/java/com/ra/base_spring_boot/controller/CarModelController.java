package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormCarModel;
import com.ra.base_spring_boot.dto.resp.CarModelResponseDTO;
import com.ra.base_spring_boot.services.ICarModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/car-models")
@RequiredArgsConstructor
public class CarModelController
{
    private final ICarModelService carModelService;

    /**
     * @apiNote get all car models (public)
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long seriesId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    )
    {
        Pageable pageable = PageRequest.of(page, size);
        Page<CarModelResponseDTO> models = carModelService.findAll(keyword, seriesId, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(models)
                        .build()
        );
    }

    /**
     * @apiNote find car model by id (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(carModelService.findById(id))
                        .build()
        );
    }

    /**
     * @apiNote create new car model (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody FormCarModel form)
    {
        CarModelResponseDTO created = carModelService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/car-models")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(created)
                        .build()
        );
    }

    /**
     * @apiNote update car model by id (ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody FormCarModel form
    )
    {
        CarModelResponseDTO updated = carModelService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }

    /**
     * @apiNote delete car model by id (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id)
    {
        carModelService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete car model successfully")
                        .build()
        );
    }
}
