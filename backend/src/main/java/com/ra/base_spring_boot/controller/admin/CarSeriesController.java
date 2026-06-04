package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.response.PageResponse;
import com.ra.base_spring_boot.dto.request.FormCarSeries;
import com.ra.base_spring_boot.dto.response.CarSeriesResponseDTO;
import com.ra.base_spring_boot.service.ICarSeriesService;
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
@RequestMapping("/api/v1/car-series")
@RequiredArgsConstructor
public class CarSeriesController
{
    private final ICarSeriesService carSeriesService;

    /**
     * @apiNote get all car series (public)
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    )
    {
        Pageable pageable = PageRequest.of(page, size);
        Page<CarSeriesResponseDTO> series = carSeriesService.findAll(keyword, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(PageResponse.from(series))
                        .build()
        );
    }

    /**
     * @apiNote find car series by id (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(carSeriesService.findById(id))
                        .build()
        );
    }

    /**
     * @apiNote create new car series (ADMIN only)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@ModelAttribute FormCarSeries form)
    {
        CarSeriesResponseDTO created = carSeriesService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/car-series")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(created)
                        .build()
        );
    }

    /**
     * @apiNote update car series by id (ADMIN only)
     */
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @ModelAttribute FormCarSeries form
    )
    {
        CarSeriesResponseDTO updated = carSeriesService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }

    /**
     * @apiNote delete car series by id (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id)
    {
        carSeriesService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete car series successfully")
                        .build()
        );
    }
}
