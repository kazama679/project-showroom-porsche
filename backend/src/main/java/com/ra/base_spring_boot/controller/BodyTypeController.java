package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.model.BodyType;
import com.ra.base_spring_boot.repository.IBodyTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/body-types")
@RequiredArgsConstructor
public class BodyTypeController
{
    private final IBodyTypeRepository bodyTypeRepository;

    @GetMapping
    public ResponseEntity<?> findAll()
    {
        List<BodyType> bodyTypes = bodyTypeRepository.findAll();
        
        return ResponseEntity.ok(ResponseWrapper.builder()
                .status(HttpStatus.OK)
                .code(200)
                .data(bodyTypes)
                .build());
    }
}
