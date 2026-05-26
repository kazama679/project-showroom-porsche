package com.ra.base_spring_boot.dto.res;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import com.ra.base_spring_boot.entity.AiChatMessage;
import com.ra.base_spring_boot.entity.CarModel;

@Data
@Builder
public class AiChatResponseDTO {
    private Long sessionId;
    private String responseText;
    private List<CarModelOptionDTO> recommendedCars;
    
    @Data
    @Builder
    public static class CarModelOptionDTO {
        private Long id;
        private String name;
        private String price;
        private String description;
        private String imageUrl;
        private List<String> features;
    }
}
