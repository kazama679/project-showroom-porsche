package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.VehicleListingRequest;
import com.ra.base_spring_boot.dto.response.VehicleListingResponse;
import com.ra.base_spring_boot.entity.VehicleListing;
import com.ra.base_spring_boot.entity.VehicleListingImage;
import com.ra.base_spring_boot.repository.IVehicleListingRepository;
import com.ra.base_spring_boot.service.ICloudinaryService;
import com.ra.base_spring_boot.service.IEmailService;
import com.ra.base_spring_boot.service.IVehicleListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleListingServiceImpl implements IVehicleListingService {

    private final IVehicleListingRepository listingRepository;
    private final ICloudinaryService cloudinaryService;
    private final IEmailService emailService;

    private static final Set<String> SENSITIVE_TYPES = new HashSet<>(Arrays.asList("TITLE_DOC", "REGISTRATION_DOC"));
    private static final Set<String> REQUIRED_TYPES = new HashSet<>(Arrays.asList(
            "FRONT", "REAR", "SIDE_LEFT", "SIDE_RIGHT", "INTERIOR", "ODOMETER", "DASHBOARD"
    ));

    @Override
    @Transactional
    public VehicleListingResponse createListing(VehicleListingRequest request, List<MultipartFile> images, List<String> imageTypes) {
        VehicleListing listing = VehicleListing.builder()
                // Vehicle Info
                .vin(request.getVin())
                .make(request.getMake())
                .model(request.getModel())
                .trimLevel(request.getTrimLevel())
                .modelYear(request.getModelYear())
                .mileage(request.getMileage())
                .exteriorColor(request.getExteriorColor())
                .interiorColor(request.getInteriorColor())
                .fuelType(request.getFuelType())
                .transmission(request.getTransmission())
                .drivetrain(request.getDrivetrain())
                .seats(request.getSeats())
                .registrationArea(request.getRegistrationArea())
                // Pricing
                .askingPrice(request.getAskingPrice())
                .isNegotiable(request.getIsNegotiable())
                .paymentMethods(request.getPaymentMethods())
                .hasLien(request.getHasLien())
                .zipCode(request.getZipCode())
                .city(request.getCity())
                .stateProvince(request.getStateProvince())
                .supportsShipping(request.getSupportsShipping())
                .acceptsTradeIn(request.getAcceptsTradeIn())
                // Condition
                .hasAccident(request.getHasAccident())
                .accidentDescription(request.getAccidentDescription())
                .hasFloodDamage(request.getHasFloodDamage())
                .hasRepaint(request.getHasRepaint())
                .repaintDescription(request.getRepaintDescription())
                .engineCondition(request.getEngineCondition())
                .transmissionCondition(request.getTransmissionCondition())
                .tireCondition(request.getTireCondition())
                .brakeCondition(request.getBrakeCondition())
                .hasWarningLights(request.getHasWarningLights())
                .hasElectricalIssues(request.getHasElectricalIssues())
                .hasModifications(request.getHasModifications())
                .modificationsDescription(request.getModificationsDescription())
                .hasSmokingPetExposure(request.getHasSmokingPetExposure())
                .conditionDescription(request.getConditionDescription())
                // Documents
                .hasServiceRecords(request.getHasServiceRecords())
                .dealerServiced(request.getDealerServiced())
                .lastServiceMileage(request.getLastServiceMileage())
                .hasRepairInvoices(request.getHasRepairInvoices())
                .titleStatus(request.getTitleStatus())
                .hasOpenRecalls(request.getHasOpenRecalls())
                .registrationValidUntil(request.getRegistrationValidUntil())
                .ownerNumber(request.getOwnerNumber())
                .hasCarfaxReport(request.getHasCarfaxReport())
                // Seller
                .sellerFullName(request.getSellerFullName())
                .sellerPhone(request.getSellerPhone())
                .sellerEmail(request.getSellerEmail())
                .sellerCity(request.getSellerCity())
                .sellerState(request.getSellerState())
                .sellerType(request.getSellerType())
                .preferredContactTime(request.getPreferredContactTime())
                .preferredContactMethod(request.getPreferredContactMethod())
                .status("PENDING")
                .images(new ArrayList<>())
                .build();

        // Upload images to Cloudinary and attach to listing
        if (images != null && imageTypes != null) {
            for (int i = 0; i < images.size() && i < imageTypes.size(); i++) {
                MultipartFile file = images.get(i);
                String type = imageTypes.get(i);

                String imageUrl = cloudinaryService.uploadFile(file);

                VehicleListingImage img = VehicleListingImage.builder()
                        .listing(listing)
                        .imageUrl(imageUrl)
                        .imageType(type)
                        .isRequired(REQUIRED_TYPES.contains(type))
                        .isSensitive(SENSITIVE_TYPES.contains(type))
                        .sortOrder(i)
                        .build();

                listing.getImages().add(img);
            }
        }

        VehicleListing saved = listingRepository.save(listing);
        return toResponse(saved);
    }

    @Override
    public VehicleListingResponse getListingById(Long id) {
        VehicleListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + id));
        return toResponse(listing);
    }

    @Override
    public List<VehicleListingResponse> getAllListings() {
        return listingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleListingResponse> getListingsByStatus(String status) {
        return listingRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VehicleListingResponse updateListingStatus(Long id, String status, String note) {
        VehicleListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + id));
        
        listing.setStatus(status);
        if (note != null) {
            listing.setAdminNote(note);
        }
        
        VehicleListing saved = listingRepository.save(listing);
        
        // Send email notification base on status
        if ("APPROVED".equalsIgnoreCase(status)) {
            String subject = "Porsche Showroom - Tin đăng bán xe của bạn đã được duyệt!";
            String body = "Chào " + listing.getSellerFullName() + ",\n\n" +
                          "Tin đăng bán xe " + listing.getMake() + " " + listing.getModel() + " của bạn đã được ban quản trị phê duyệt.\n" +
                          "Tin đăng hiện đã hiển thị công khai trên hệ thống và người mua có thể liên hệ với bạn.\n\n" +
                          "Trân trọng,\nĐội ngũ Porsche Showroom";
            emailService.sendEmail(listing.getSellerEmail(), subject, body);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            String subject = "Porsche Showroom - Tin đăng bán xe của bạn đã bị từ chối";
            String body = "Chào " + listing.getSellerFullName() + ",\n\n" +
                          "Rất tiếc, tin đăng bán xe " + listing.getMake() + " " + listing.getModel() + " của bạn đã bị từ chối.\n";
            if (note != null && !note.trim().isEmpty()) {
                body += "Lý do: " + note + "\n\n";
            }
            body += "Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.\n\nTrân trọng,\nĐội ngũ Porsche Showroom";
            emailService.sendEmail(listing.getSellerEmail(), subject, body);
        }
        
        return toResponse(saved);
    }

    private VehicleListingResponse toResponse(VehicleListing l) {
        List<VehicleListingResponse.ImageInfo> imageInfos = l.getImages() != null
                ? l.getImages().stream().map(img -> VehicleListingResponse.ImageInfo.builder()
                    .id(img.getId())
                    .imageUrl(img.getImageUrl())
                    .imageType(img.getImageType())
                    .isRequired(img.getIsRequired())
                    .isSensitive(img.getIsSensitive())
                    .sortOrder(img.getSortOrder())
                    .build())
                .collect(Collectors.toList())
                : new ArrayList<>();

        return VehicleListingResponse.builder()
                .id(l.getId())
                .vin(l.getVin())
                .make(l.getMake())
                .model(l.getModel())
                .trimLevel(l.getTrimLevel())
                .modelYear(l.getModelYear())
                .mileage(l.getMileage())
                .exteriorColor(l.getExteriorColor())
                .interiorColor(l.getInteriorColor())
                .fuelType(l.getFuelType())
                .transmission(l.getTransmission())
                .drivetrain(l.getDrivetrain())
                .seats(l.getSeats())
                .registrationArea(l.getRegistrationArea())
                .askingPrice(l.getAskingPrice())
                .isNegotiable(l.getIsNegotiable())
                .paymentMethods(l.getPaymentMethods())
                .hasLien(l.getHasLien())
                .zipCode(l.getZipCode())
                .city(l.getCity())
                .stateProvince(l.getStateProvince())
                .supportsShipping(l.getSupportsShipping())
                .acceptsTradeIn(l.getAcceptsTradeIn())
                .hasAccident(l.getHasAccident())
                .accidentDescription(l.getAccidentDescription())
                .hasFloodDamage(l.getHasFloodDamage())
                .hasRepaint(l.getHasRepaint())
                .repaintDescription(l.getRepaintDescription())
                .engineCondition(l.getEngineCondition())
                .transmissionCondition(l.getTransmissionCondition())
                .tireCondition(l.getTireCondition())
                .brakeCondition(l.getBrakeCondition())
                .hasWarningLights(l.getHasWarningLights())
                .hasElectricalIssues(l.getHasElectricalIssues())
                .hasModifications(l.getHasModifications())
                .modificationsDescription(l.getModificationsDescription())
                .hasSmokingPetExposure(l.getHasSmokingPetExposure())
                .conditionDescription(l.getConditionDescription())
                .hasServiceRecords(l.getHasServiceRecords())
                .dealerServiced(l.getDealerServiced())
                .lastServiceMileage(l.getLastServiceMileage())
                .hasRepairInvoices(l.getHasRepairInvoices())
                .titleStatus(l.getTitleStatus())
                .hasOpenRecalls(l.getHasOpenRecalls())
                .registrationValidUntil(l.getRegistrationValidUntil())
                .ownerNumber(l.getOwnerNumber())
                .hasCarfaxReport(l.getHasCarfaxReport())
                .sellerFullName(l.getSellerFullName())
                .sellerPhone(l.getSellerPhone())
                .sellerEmail(l.getSellerEmail())
                .sellerCity(l.getSellerCity())
                .sellerState(l.getSellerState())
                .sellerType(l.getSellerType())
                .preferredContactTime(l.getPreferredContactTime())
                .preferredContactMethod(l.getPreferredContactMethod())
                .status(l.getStatus())
                .adminNote(l.getAdminNote())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .images(imageInfos)
                .build();
    }
}
