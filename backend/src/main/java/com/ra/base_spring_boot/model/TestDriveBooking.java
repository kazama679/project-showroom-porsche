package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "test_drive_bookings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TestDriveBooking extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_model_id", nullable = false)
    private CarModel carModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showroom_id", nullable = false)
    private ShowroomLocation showroom;

    @Column(name = "booking_date", nullable = false)
    private Instant bookingDate;

    @Column(name = "status", length = 50)
    private String status;
}
