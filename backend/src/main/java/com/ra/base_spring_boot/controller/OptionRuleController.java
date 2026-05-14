package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormOptionRule;
import com.ra.base_spring_boot.dto.resp.OptionRuleResponseDTO;
import com.ra.base_spring_boot.services.IOptionRuleService;
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
@RequestMapping("/api/v1/option-rules")
@RequiredArgsConstructor
public class OptionRuleController
{
    private final IOptionRuleService optionRuleService;

    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    )
    {
        Pageable pageable = PageRequest.of(page, size);
        Page<OptionRuleResponseDTO> rules = optionRuleService.findAll(keyword, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(rules)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(optionRuleService.findById(id))
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody FormOptionRule form)
    {
        OptionRuleResponseDTO created = optionRuleService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/option-rules")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(created)
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody FormOptionRule form
    )
    {
        OptionRuleResponseDTO updated = optionRuleService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id)
    {
        optionRuleService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete option rule successfully")
                        .build()
        );
    }
}
