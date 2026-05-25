package com.ra.base_spring_boot.controller.student;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.service.IConfiguratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/car-models")
@RequiredArgsConstructor
public class ConfiguratorController
{
    private final IConfiguratorService configuratorService;

    /**
     * @apiNote get configurator data for a car model (public)
     */
    @GetMapping("/{id}/configurator")
    public ResponseEntity<?> getConfigurator(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(configuratorService.getByCarModelId(id))
                        .build()
        );
    }
}
