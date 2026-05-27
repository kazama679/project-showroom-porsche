package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.VehicleListingImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IVehicleListingImageRepository extends JpaRepository<VehicleListingImage, Long> {
    List<VehicleListingImage> findByListingIdOrderBySortOrder(Long listingId);
}
