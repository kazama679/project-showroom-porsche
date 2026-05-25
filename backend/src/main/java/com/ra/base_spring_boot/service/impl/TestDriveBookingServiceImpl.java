package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.req.TestDriveBookingAdminActionRequest;
import com.ra.base_spring_boot.dto.req.TestDriveBookingRequest;
import com.ra.base_spring_boot.dto.resp.TestDriveBookingResponse;
import com.ra.base_spring_boot.model.TestDriveBooking;
import com.ra.base_spring_boot.model.TestDriveBookingStatus;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.CarModel;
import com.ra.base_spring_boot.repository.ITestDriveBookingRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.service.TestDriveBookingService;
import com.ra.base_spring_boot.service.MailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Service
@Transactional
public class TestDriveBookingServiceImpl implements TestDriveBookingService {

    private final ITestDriveBookingRepository bookingRepo;
    private final ICarModelRepository carModelRepo;
    private final MailService mailService;

    public TestDriveBookingServiceImpl(ITestDriveBookingRepository bookingRepo,
                                      ICarModelRepository carModelRepo,
                                      MailService mailService) {
        this.bookingRepo = bookingRepo;
        this.carModelRepo = carModelRepo;
        this.mailService = mailService;
    }

    @Override
    public TestDriveBookingResponse createBooking(TestDriveBookingRequest request, User currentUserNullable) {
        TestDriveBooking booking = new TestDriveBooking();
        // set optional user
        if (currentUserNullable != null) {
            booking.setUser(currentUserNullable);
        }
        // car model handling
        if (request.getCarModelId() != null) {
            CarModel model = carModelRepo.findById(request.getCarModelId()).orElse(null);
            if (model != null) {
                booking.setCarModel(model);
                booking.setCarName(model.getName());
            } else {
                booking.setCarName(request.getCarName());
            }
        } else {
            booking.setCarName(request.getCarName());
        }
        // other fields
        booking.setCarName(request.getCarName());
        booking.setPorscheCode(request.getPorscheCode());
        booking.setDealerName(request.getDealerName());
        booking.setDealerAddress(request.getDealerAddress());
        booking.setSalutation(request.getSalutation());
        booking.setFirstName(request.getFirstName());
        booking.setLastName(request.getLastName());
        booking.setEmail(request.getEmail());
        booking.setCountryCode(request.getCountryCode());
        booking.setPhoneNumber(request.getPhoneNumber());
        booking.setPreferredDate(request.getPreferredDate());
        booking.setPreferredTime(request.getPreferredTime());
        booking.setMessage(request.getMessage());
        booking.setStatus(TestDriveBookingStatus.PENDING);
        // persist
        TestDriveBooking saved = bookingRepo.save(booking);
        // send email, ignore failures
        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendTestDriveSubmittedEmail(saved.getEmail(), saved);
            } catch (Exception e) {
                System.err.println("[TestDriveBooking] Email send failed: " + e.getMessage());
            }
        });
        return toResponse(saved);
    }

    @Override
    public List<TestDriveBookingResponse> getMyBookings(User currentUser) {
        List<TestDriveBooking> list = bookingRepo.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<TestDriveBookingResponse> getAllBookingsForAdmin() {
        return bookingRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TestDriveBookingResponse getBookingDetailForAdmin(Long id) {
        TestDriveBooking booking = bookingRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return toResponse(booking);
    }

    @Override
    public TestDriveBookingResponse approveBooking(Long id, String adminNote) {
        TestDriveBooking booking = bookingRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() == TestDriveBookingStatus.APPROVED) {
            return toResponse(booking);
        }
        booking.setStatus(TestDriveBookingStatus.APPROVED);
        booking.setAdminNote(adminNote);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setRejectedAt(null);
        TestDriveBooking saved = bookingRepo.save(booking);
        
        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendTestDriveApprovedEmail(saved.getEmail(), saved);
            } catch (Exception e) {
                System.err.println("[TestDriveBooking] Email send failed: " + e.getMessage());
            }
        });
        
        return toResponse(saved);
    }

    @Override
    public TestDriveBookingResponse rejectBooking(Long id, String adminNote) {
        TestDriveBooking booking = bookingRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        booking.setStatus(TestDriveBookingStatus.REJECTED);
        booking.setAdminNote(adminNote);
        booking.setRejectedAt(LocalDateTime.now());
        booking.setApprovedAt(null);
        TestDriveBooking saved = bookingRepo.save(booking);
        
        CompletableFuture.runAsync(() -> {
            try {
                mailService.sendTestDriveRejectedEmail(saved.getEmail(), saved);
            } catch (Exception e) {
                System.err.println("[TestDriveBooking] Email send failed: " + e.getMessage());
            }
        });
        
        return toResponse(saved);
    }

    @Override
    public void deleteBooking(Long id) {
        bookingRepo.deleteById(id);
    }

    private TestDriveBookingResponse toResponse(TestDriveBooking booking) {
        TestDriveBookingResponse resp = new TestDriveBookingResponse();
        resp.setId(booking.getId());
        if (booking.getUser() != null) resp.setUserId(booking.getUser().getId());
        if (booking.getCarModel() != null) resp.setCarModelId(booking.getCarModel().getId());
        resp.setCarName(booking.getCarName());
        resp.setPorscheCode(booking.getPorscheCode());
        resp.setDealerName(booking.getDealerName());
        resp.setDealerAddress(booking.getDealerAddress());
        resp.setSalutation(booking.getSalutation());
        resp.setFirstName(booking.getFirstName());
        resp.setLastName(booking.getLastName());
        String full = (booking.getFirstName() != null ? booking.getFirstName() + " " : "") + (booking.getLastName() != null ? booking.getLastName() : "");
        resp.setFullName(full.trim());
        resp.setEmail(booking.getEmail());
        resp.setCountryCode(booking.getCountryCode());
        resp.setPhoneNumber(booking.getPhoneNumber());
        resp.setPreferredDate(booking.getPreferredDate());
        resp.setPreferredTime(booking.getPreferredTime());
        resp.setMessage(booking.getMessage());
        resp.setStatus(booking.getStatus() != null ? booking.getStatus().name() : null);
        resp.setAdminNote(booking.getAdminNote());
        resp.setApprovedAt(booking.getApprovedAt());
        resp.setRejectedAt(booking.getRejectedAt());
        resp.setCreatedAt(booking.getCreatedAt());
        resp.setUpdatedAt(booking.getUpdatedAt());
        return resp;
    }
}
