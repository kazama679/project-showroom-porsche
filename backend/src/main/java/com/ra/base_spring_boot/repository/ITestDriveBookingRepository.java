package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.model.TestDriveBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ITestDriveBookingRepository extends JpaRepository<TestDriveBooking, Long> {
    List<TestDriveBooking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<TestDriveBooking> findAllByOrderByCreatedAtDesc();
}
