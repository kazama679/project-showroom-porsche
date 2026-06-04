package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.response.PageResponse;
import com.ra.base_spring_boot.dto.request.FormOptionCategory;
import com.ra.base_spring_boot.dto.response.OptionCategoryResponseDTO;
import com.ra.base_spring_boot.service.IOptionCategoryService;
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
@RequestMapping("/api/v1/option-categories")
@RequiredArgsConstructor
public class OptionCategoryController
{
    private final IOptionCategoryService optionCategoryService;

    /**
     * @apiNote get all option categories (public)
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    )
    {
        Pageable pageable = PageRequest.of(page, size);
        Page<OptionCategoryResponseDTO> categories = optionCategoryService.findAll(keyword, pageable);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(PageResponse.from(categories))
                        .build()
        );
    }

    /**
     * @apiNote find option category by id (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id)
    {
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(optionCategoryService.findById(id))
                        .build()
        );
    }

    /**
     * @apiNote create new option category (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody FormOptionCategory form)
    {
        OptionCategoryResponseDTO created = optionCategoryService.create(form);

        return ResponseEntity.created(URI.create("/api/v1/option-categories")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data(created)
                        .build()
        );
    }

    /**
     * @apiNote update option category by id (ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody FormOptionCategory form
    )
    {
        OptionCategoryResponseDTO updated = optionCategoryService.update(id, form);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(updated)
                        .build()
        );
    }

    /**
     * @apiNote delete option category by id (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id)
    {
        optionCategoryService.delete(id);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Delete option category successfully")
                        .build()
        );
    }
}
