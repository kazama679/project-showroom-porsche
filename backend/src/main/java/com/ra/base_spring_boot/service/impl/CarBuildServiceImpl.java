package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.CarBuildRequest;
import com.ra.base_spring_boot.dto.response.CarBuildResponse;
import com.ra.base_spring_boot.entity.CarBuild;
import com.ra.base_spring_boot.entity.CarModel;
import com.ra.base_spring_boot.entity.User;
import com.ra.base_spring_boot.repository.ICarBuildRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.service.ICarBuildService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CarBuildServiceImpl implements ICarBuildService {

    @Autowired
    private ICarBuildRepository carBuildRepository;

    @Autowired
    private ICarModelRepository carModelRepository;

    @Override
    public CarBuildResponse saveBuild(CarBuildRequest request, User user) {
        CarModel model = carModelRepository.findById(request.getModelId())
                .orElseThrow(() -> new RuntimeException("Car model not found"));
        
        CarBuild build = CarBuild.builder()
                .user(user)
                .carModel(model)
                .basePrice(request.getBaseMsrp())
                .totalPrice(request.getTotalPrice())
                .porscheCode(generatePorscheCode())
                .colorName(request.getColorName())
                .interiorName(request.getInteriorName())
                .imageUrl(request.getImageUrl())
                .galleryImages(request.getGalleryImages() != null ? String.join(",", request.getGalleryImages()) : null)
                .selections(request.getSelections())
                .build();
                
        carBuildRepository.save(build);
        
        return mapToResponse(build, request.getModelName(), request.getModelYear(), request.getEngineInfo(), request.getDriveType(), request.getTransmission(), request.getEquipmentPrice(), request.getDeliveryFee());
    }

    @Override
    public List<CarBuildResponse> getUserBuilds(User user) {
        return carBuildRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(build -> mapToResponse(build, build.getCarModel().getName(), build.getCarModel().getYear(), null, null, null, null, null))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteBuild(Long id, User user) {
        CarBuild build = carBuildRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Saved build not found"));
                
        if (!build.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        carBuildRepository.delete(build);
    }
    
    @Override
    public CarBuildResponse getBuildByCode(String porscheCode) {
        CarBuild build = carBuildRepository.findByPorscheCode(porscheCode)
                .orElseThrow(() -> new RuntimeException("Build not found for code: " + porscheCode));
        return mapToResponse(build, build.getCarModel().getName(), build.getCarModel().getYear(), null, null, null, null, null);
    }
    
    private String generatePorscheCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder("P");
        Random random = new Random();
        for (int i = 0; i < 7; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    private CarBuildResponse mapToResponse(CarBuild build, String modelName, Integer modelYear, String engineInfo, String driveType, String transmission, java.math.BigDecimal equipmentPrice, java.math.BigDecimal deliveryFee) {
        return CarBuildResponse.builder()
                .id(build.getId().toString())
                .modelId(build.getCarModel().getId())
                .modelName(modelName != null ? modelName : build.getCarModel().getName())
                .modelYear(modelYear != null ? modelYear : build.getCarModel().getYear())
                .porscheCode(build.getPorscheCode())
                .createdAt(build.getCreatedAt())
                .imageUrl(build.getImageUrl())
                .galleryImages(build.getGalleryImages() != null ? Arrays.asList(build.getGalleryImages().split(",")) : null)
                .totalPrice(build.getTotalPrice())
                .baseMsrp(build.getBasePrice())
                .equipmentPrice(equipmentPrice != null ? equipmentPrice : java.math.BigDecimal.ZERO)
                .deliveryFee(deliveryFee != null ? deliveryFee : java.math.BigDecimal.ZERO)
                .selections(build.getSelections())
                .colorName(build.getColorName())
                .interiorName(build.getInteriorName())
                .engineInfo(engineInfo)
                .driveType(driveType)
                .transmission(transmission)
                .build();
    }
}
