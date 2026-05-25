package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.req.TestDriveBookingRequest;
import com.ra.base_spring_boot.dto.req.TestDriveBookingAdminActionRequest;
import com.ra.base_spring_boot.dto.resp.TestDriveBookingResponse;
import com.ra.base_spring_boot.model.User;
import java.util.List;

public interface TestDriveBookingService {
    TestDriveBookingResponse createBooking(TestDriveBookingRequest request, User currentUserNullable);
    List<TestDriveBookingResponse> getMyBookings(User currentUser);
    List<TestDriveBookingResponse> getAllBookingsForAdmin();
    TestDriveBookingResponse getBookingDetailForAdmin(Long id);
    TestDriveBookingResponse approveBooking(Long id, String adminNote);
    TestDriveBookingResponse rejectBooking(Long id, String adminNote);
    void deleteBooking(Long id);
}
