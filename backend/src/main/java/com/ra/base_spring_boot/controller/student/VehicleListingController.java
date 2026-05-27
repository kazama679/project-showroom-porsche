package com.ra.base_spring_boot.controller.student;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ra.base_spring_boot.dto.request.VehicleListingRequest;
import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.response.VehicleListingResponse;
import com.ra.base_spring_boot.service.IVehicleListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehicle-listings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class VehicleListingController {

    private final IVehicleListingService vehicleListingService;
    private final ObjectMapper objectMapper;

    /**
     * Create a new vehicle listing with images.
     * Accepts multipart/form-data with:
     *  - "data" part: JSON string of VehicleListingRequest
     *  - "images" part: multiple image files
     *  - "imageTypes" part: comma-separated image type strings matching each image
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createListing(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "imageTypes", required = false) List<String> imageTypes
    ) throws Exception {
        VehicleListingRequest request = objectMapper.readValue(dataJson, VehicleListingRequest.class);
        VehicleListingResponse response = vehicleListingService.createListing(request, images, imageTypes);
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(vehicleListingService.getListingById(id))
                        .build()
        );
    }
}

