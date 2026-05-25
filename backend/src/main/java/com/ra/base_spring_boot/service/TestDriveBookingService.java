package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.TestDriveBookingRequest;
import com.ra.base_spring_boot.dto.request.TestDriveBookingAdminActionRequest;
import com.ra.base_spring_boot.dto.response.TestDriveBookingResponse;
import com.ra.base_spring_boot.entity.User;
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
