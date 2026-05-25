package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.request.FormBodyType;
import com.ra.base_spring_boot.entity.BodyType;
import com.ra.base_spring_boot.repository.IBodyTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/v1/body-types")
@RequiredArgsConstructor
@SuppressWarnings({"NullAway", "nullness"})
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

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable long id)
    {
        BodyType bodyType = bodyTypeRepository.findById(Long.valueOf(id)).orElse(null);
        if (bodyType == null)
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseWrapper.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .code(404)
                    .data("Body type not found")
                    .build());
        }
        return ResponseEntity.ok(ResponseWrapper.builder()
                .status(HttpStatus.OK)
                .code(200)
                .data(bodyType)
                .build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody FormBodyType form)
    {
        if (form.getName() == null || form.getName().trim().isEmpty())
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseWrapper.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .code(400)
                    .data("Name is required")
                    .build());
        }

        BodyType entity = BodyType.builder()
                .name(form.getName().trim())
                .description(form.getDescription())
                .build();

        BodyType created = bodyTypeRepository.save(entity);

        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseWrapper.builder()
                .status(HttpStatus.CREATED)
                .code(201)
                .data(created)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> update(@PathVariable long id, @RequestBody FormBodyType form)
    {
        BodyType existing = bodyTypeRepository.findById(Long.valueOf(id)).orElse(null);
        if (existing == null)
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseWrapper.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .code(404)
                    .data("Body type not found")
                    .build());
        }

        if (form.getName() != null && !form.getName().trim().isEmpty())
        {
            existing.setName(form.getName().trim());
        }
        existing.setDescription(form.getDescription());

        BodyType updated = bodyTypeRepository.save(existing);

        return ResponseEntity.ok(ResponseWrapper.builder()
                .status(HttpStatus.OK)
                .code(200)
                .data(updated)
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable long id)
    {
        BodyType existing = bodyTypeRepository.findById(Long.valueOf(id)).orElse(null);
        if (existing == null)
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseWrapper.builder()
                    .status(HttpStatus.NOT_FOUND)
                    .code(404)
                    .data("Body type not found")
                    .build());
        }

        bodyTypeRepository.delete(existing);
        return ResponseEntity.ok(ResponseWrapper.builder()
                .status(HttpStatus.OK)
                .code(200)
                .data("Delete body type successfully")
                .build());
    }
}
