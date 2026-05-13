package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.CarSpecsDTO;
import com.ra.base_spring_boot.service.CarSpecService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/car-models")
@RequiredArgsConstructor
public class CarSpecController {

    private final CarSpecService carSpecService;

    /**
     * @apiNote get all specs for a car model (public)
     */
    @GetMapping("/{id}/specs")
    public ResponseEntity<?> getSpecs(@PathVariable Long id) {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(carSpecService.getSpecsByCarModelId(id))
                        .build()
        );
    }

    /**
     * @apiNote update all specs for a car model (ADMIN only)
     */
    @PutMapping("/{id}/specs")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> saveSpecs(
            @PathVariable Long id,
            @RequestBody CarSpecsDTO specsDTO
    ) {
        CarSpecsDTO updated = carSpecService.saveSpecs(id, specsDTO);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }
}
