package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.VehicleInquiryRequest;
import com.ra.base_spring_boot.dto.request.VehicleListingRequest;
import com.ra.base_spring_boot.dto.response.VehicleListingResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IVehicleListingService {
    VehicleListingResponse createListing(VehicleListingRequest request, List<MultipartFile> images, List<String> imageTypes);
    VehicleListingResponse getListingById(Long id);
    List<VehicleListingResponse> getAllListings();
    List<VehicleListingResponse> getListingsByStatus(String status);
    VehicleListingResponse updateListingStatus(Long id, String status, String adminNote);
    void sendInquiry(VehicleInquiryRequest request);
}
