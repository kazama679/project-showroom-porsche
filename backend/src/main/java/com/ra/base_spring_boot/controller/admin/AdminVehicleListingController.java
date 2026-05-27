package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.response.VehicleListingResponse;
import com.ra.base_spring_boot.service.IVehicleListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/vehicle-listings")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminVehicleListingController {

    private final IVehicleListingService vehicleListingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllListings(
            @RequestParam(required = false) String status) {
        List<VehicleListingResponse> listings;
        if (status != null && !status.isEmpty()) {
            listings = vehicleListingService.getListingsByStatus(status);
        } else {
            listings = vehicleListingService.getAllListings();
        }
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(listings)
                        .build()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(vehicleListingService.getListingById(id))
                        .build()
        );
    }

    /**
     * Update the status of a listing (e.g. APPROVED, REJECTED).
     * Request body can optionally contain {"note": "reason for rejection"}
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateListingStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = (body != null && body.containsKey("note")) ? body.get("note") : null;
        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(vehicleListingService.updateListingStatus(id, status, note))
                        .build()
        );
    }
}
