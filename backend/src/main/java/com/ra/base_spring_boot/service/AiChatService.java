package com.ra.base_spring_boot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ra.base_spring_boot.dto.req.AiChatRequestDTO;
import com.ra.base_spring_boot.dto.res.AiChatResponseDTO;
import com.ra.base_spring_boot.entity.AiChatMessage;
import com.ra.base_spring_boot.entity.AiChatSession;
import com.ra.base_spring_boot.entity.CarImage;
import com.ra.base_spring_boot.entity.CarModel;
import com.ra.base_spring_boot.entity.User;
import com.ra.base_spring_boot.repository.AiChatMessageRepository;
import com.ra.base_spring_boot.repository.AiChatSessionRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private final GeminiAiService geminiAiService;
    private final AiChatSessionRepository sessionRepository;
    private final AiChatMessageRepository messageRepository;
    private final ICarModelRepository carModelRepository;
    private final IUserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AiChatResponseDTO handleChat(AiChatRequestDTO request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        AiChatSession session;
        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId()).orElseThrow(() -> new RuntimeException("Session not found"));
        } else {
            session = AiChatSession.builder().user(user).build();
            session = sessionRepository.save(session);
        }

        // Save User Message
        AiChatMessage userMsg = AiChatMessage.builder()
                .session(session)
                .sender("USER")
                .content(request.getMessage())
                .build();
        messageRepository.save(userMsg);

        // Fetch Cars for Context
        List<CarModel> allCars = carModelRepository.findAll();
        List<Map<String, Object>> carsData = allCars.stream().map(car -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", car.getId());
            map.put("name", car.getName());
            map.put("price", car.getBasePrice());
            map.put("seats", car.getSeats());
            map.put("fuelType", car.getFuelType());
            return map;
        }).toList();

        // Call Gemini
        String aiResponseJsonStr = geminiAiService.generateChatResponse(request.getMessage(), carsData);
        
        // Parse JSON
        String responseText = "";
        List<Long> recommendedIds = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(aiResponseJsonStr);
            if (root.has("response_text")) {
                responseText = root.get("response_text").asText();
            }
            if (root.has("recommended_car_ids")) {
                root.get("recommended_car_ids").forEach(node -> recommendedIds.add(node.asLong()));
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse Gemini output as JSON. Fallback to raw string.", e);
            responseText = aiResponseJsonStr;
        }

        // Validate IDs
        List<CarModel> recommendedCars = new ArrayList<>();
        if (!recommendedIds.isEmpty()) {
            recommendedCars = carModelRepository.findAllById(recommendedIds);
        }

        // Save AI Message
        AiChatMessage aiMsg = AiChatMessage.builder()
                .session(session)
                .sender("AI")
                .content(responseText)
                .recommendedCarIds(recommendedIds.isEmpty() ? null : recommendedIds.toString())
                .build();
        messageRepository.save(aiMsg);

        // Build Response DTO
        List<AiChatResponseDTO.CarModelOptionDTO> carDtos = recommendedCars.stream().map(car -> {
            String imageUrl = "";
            if (car.getImages() != null && !car.getImages().isEmpty()) {
                imageUrl = car.getImages().stream().filter(CarImage::getIsDefault).findFirst()
                        .map(CarImage::getImageUrl).orElse(car.getImages().get(0).getImageUrl());
            }
            return AiChatResponseDTO.CarModelOptionDTO.builder()
                    .id(car.getId())
                    .name(car.getName())
                    .price("$" + String.format("%,.0f", car.getBasePrice()))
                    .description(car.getShortDescription())
                    .imageUrl(imageUrl)
                    .features(Arrays.asList(car.getFuelType(), car.getSeats() + " seats", car.getTransmission()))
                    .build();
        }).toList();

        return AiChatResponseDTO.builder()
                .sessionId(session.getId())
                .responseText(responseText)
                .recommendedCars(carDtos)
                .build();
    }

    public List<Map<String, Object>> getUserSessions(Long userId) {
        List<AiChatSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return sessions.stream().map(session -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", session.getId());
            map.put("createdAt", session.getCreatedAt());
            // get first user message as preview
            List<AiChatMessage> msgs = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
            String preview = msgs.stream()
                .filter(m -> "USER".equals(m.getSender()))
                .findFirst()
                .map(AiChatMessage::getContent)
                .orElse("");
            map.put("preview", preview);
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getSessionHistory(Long sessionId) {
        List<AiChatMessage> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        List<Map<String, Object>> history = new ArrayList<>();
        
        for (AiChatMessage msg : messages) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("sender", msg.getSender());
            map.put("content", msg.getContent());
            map.put("createdAt", msg.getCreatedAt());
            
            if (msg.getRecommendedCarIds() != null && !msg.getRecommendedCarIds().isEmpty()) {
                // Parse IDs
                String idsStr = msg.getRecommendedCarIds().replace("[", "").replace("]", "").replace(" ", "");
                if (!idsStr.isEmpty()) {
                    List<Long> ids = Arrays.stream(idsStr.split(",")).map(Long::parseLong).toList();
                    List<CarModel> cars = carModelRepository.findAllById(ids);
                    
                    List<AiChatResponseDTO.CarModelOptionDTO> carDtos = cars.stream().map(car -> {
                        String imageUrl = "";
                        if (car.getImages() != null && !car.getImages().isEmpty()) {
                            imageUrl = car.getImages().stream().filter(CarImage::getIsDefault).findFirst()
                                    .map(CarImage::getImageUrl).orElse(car.getImages().get(0).getImageUrl());
                        }
                        return AiChatResponseDTO.CarModelOptionDTO.builder()
                                .id(car.getId())
                                .name(car.getName())
                                .price("$" + String.format("%,.0f", car.getBasePrice()))
                                .description(car.getShortDescription())
                                .imageUrl(imageUrl)
                                .features(Arrays.asList(car.getFuelType(), car.getSeats() + " seats", car.getTransmission()))
                                .build();
                    }).toList();
                    map.put("recommendedCars", carDtos);
                }
            }
            history.add(map);
        }
        return history;
    }
}
