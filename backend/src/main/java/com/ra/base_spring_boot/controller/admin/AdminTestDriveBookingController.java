package com.ra.base_spring_boot.controller.admin;

import com.ra.base_spring_boot.dto.request.TestDriveBookingAdminActionRequest;
import com.ra.base_spring_boot.dto.response.TestDriveBookingResponse;
import com.ra.base_spring_boot.service.TestDriveBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/test-drive-bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTestDriveBookingController {

    private final TestDriveBookingService bookingService;

    public AdminTestDriveBookingController(TestDriveBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<TestDriveBookingResponse>> getAll() {
        List<TestDriveBookingResponse> list = bookingService.getAllBookingsForAdmin();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestDriveBookingResponse> getDetail(@PathVariable Long id) {
        TestDriveBookingResponse resp = bookingService.getBookingDetailForAdmin(id);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TestDriveBookingResponse> approve(@PathVariable Long id,
                                                             @RequestBody TestDriveBookingAdminActionRequest req) {
        TestDriveBookingResponse resp = bookingService.approveBooking(id, req.getAdminNote());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TestDriveBookingResponse> reject(@PathVariable Long id,
                                                            @RequestBody TestDriveBookingAdminActionRequest req) {
        TestDriveBookingResponse resp = bookingService.rejectBooking(id, req.getAdminNote());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
