package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.req.CarBuildRequest;
import com.ra.base_spring_boot.dto.resp.CarBuildResponse;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.service.ICarBuildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/car-builds")
@RequiredArgsConstructor
public class CarBuildController {

    private final ICarBuildService carBuildService;

    @PostMapping
    public ResponseEntity<CarBuildResponse> saveCarBuild(
            @RequestBody CarBuildRequest request,
            @AuthenticationPrincipal MyUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userDetails.getUser();
        CarBuildResponse response = carBuildService.saveBuild(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-builds")
    public ResponseEntity<List<CarBuildResponse>> getMyBuilds(
            @AuthenticationPrincipal MyUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userDetails.getUser();
        List<CarBuildResponse> responses = carBuildService.getUserBuilds(user);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCarBuild(
            @PathVariable Long id,
            @AuthenticationPrincipal MyUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userDetails.getUser();
        carBuildService.deleteBuild(id, user);
        return ResponseEntity.noContent().build();
    }
}
