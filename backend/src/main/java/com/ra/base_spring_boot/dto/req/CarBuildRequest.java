package com.ra.base_spring_boot.dto.req;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class CarBuildRequest {
    private Long modelId;
    private String modelName;
    private Integer modelYear;
    private String imageUrl;
    private List<String> galleryImages;
    private BigDecimal totalPrice;
    private BigDecimal baseMsrp;
    private BigDecimal equipmentPrice;
    private BigDecimal deliveryFee;
    
    // Using Object to accept the JSON structure from frontend directly, 
    // but a Map<String, List<String>> or raw String is better if we just serialize it.
    private String selections; 
    
    private String colorName;
    private String interiorName;
    private String engineInfo;
    private String driveType;
    private String transmission;
}
