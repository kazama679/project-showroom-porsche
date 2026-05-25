package com.ra.base_spring_boot.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarBuildResponse {
    private String id;
    private Long modelId;
    private String modelName;
    private Integer modelYear;
    private String porscheCode;
    private LocalDateTime createdAt;
    private String imageUrl;
    private List<String> galleryImages;
    private BigDecimal totalPrice;
    private BigDecimal baseMsrp;
    private BigDecimal equipmentPrice;
    private BigDecimal deliveryFee;
    
    // Serialized selection map mapped back to raw string for frontend consumption
    private String selections; 
    
    private String colorName;
    private String interiorName;
    private String engineInfo;
    private String driveType;
    private String transmission;
}
