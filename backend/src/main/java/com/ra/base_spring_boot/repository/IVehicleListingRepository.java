package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.VehicleListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IVehicleListingRepository extends JpaRepository<VehicleListing, Long> {
    List<VehicleListing> findByStatusOrderByCreatedAtDesc(String status);
    List<VehicleListing> findAllByOrderByCreatedAtDesc();
}
