package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.req.TestDriveBookingRequest;
import com.ra.base_spring_boot.dto.resp.TestDriveBookingResponse;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.service.TestDriveBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/test-drive-bookings")
public class TestDriveBookingController {

    private final TestDriveBookingService bookingService;

    public TestDriveBookingController(TestDriveBookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Anonymous users can submit a booking
    @PostMapping
    public ResponseEntity<TestDriveBookingResponse> createBooking(@RequestBody TestDriveBookingRequest request,
                                                                 @AuthenticationPrincipal User currentUser) {
        TestDriveBookingResponse resp = bookingService.createBooking(request, currentUser);
        return ResponseEntity.ok(resp);
    }

    // Authenticated users can view their own bookings
    @GetMapping("/my-bookings")
    public ResponseEntity<List<TestDriveBookingResponse>> getMyBookings(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        List<TestDriveBookingResponse> list = bookingService.getMyBookings(currentUser);
        return ResponseEntity.ok(list);
    }
}
