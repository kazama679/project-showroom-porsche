package com.ra.base_spring_boot.ai;

import com.ra.base_spring_boot.entity.CarImage;
import com.ra.base_spring_boot.entity.CarModel;
import com.ra.base_spring_boot.repository.ICarImageRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import dev.langchain4j.model.chat.ChatModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {
    private final RagRetrievalService ragRetrievalService;
    private final ChatModel chatModel;
    private final ICarModelRepository carModelRepository;
    private final ICarImageRepository carImageRepository;

    public AiChatResponse chat(AiChatRequest request) {
        String message = request.getMessage();

        Optional<AiChatResponse> carModelAnswer = answerCarModelQuestionFromDatabase(message);
        if (carModelAnswer.isPresent()) {
            return carModelAnswer.get();
        }

        Optional<AiChatResponse> budgetAnswer = answerBudgetQuestionFromDatabase(message);
        if (budgetAnswer.isPresent()) {
            return budgetAnswer.get();
        }

        if (looksLikeCarQuestion(message)) {
            return generalKnowledgeAnswer(message, true);
        }

        List<RagRetrievalService.RetrievedKnowledge> retrieved = ragRetrievalService.retrieve(message);
        if (!retrieved.isEmpty()) {
            String answer = callModel(buildGroundedPrompt(message, retrieved), true);
            return AiChatResponse.builder()
                    .answer(answer)
                    .sources(retrieved.stream().map(this::toSource).toList())
                    .confidence(confidence(retrieved))
                    .usedInternalKnowledge(true)
                    .build();
        }

        return generalKnowledgeAnswer(message, false);
    }

    private AiChatResponse generalKnowledgeAnswer(String question, boolean carNotFoundInDatabase) {
        String answer = callModel(buildGeneralKnowledgePrompt(question, carNotFoundInDatabase), false);
        return AiChatResponse.builder()
                .answer(answer)
                .sources(List.of())
                .confidence(0.20)
                .usedInternalKnowledge(false)
                .build();
    }

    private String callModel(String prompt, boolean hasInternalContext) {
        try {
            String answer = chatModel.chat(prompt);
            if (StringUtils.hasText(answer)) {
                return answer;
            }
        } catch (Exception e) {
            log.warn("AI model call failed", e);
            return "Gemini hiện chưa trả lời được. Lỗi kỹ thuật: " + rootErrorMessage(e);
        }
        return hasInternalContext
                ? "Hệ thống đã tìm thấy dữ liệu nội bộ phù hợp, nhưng Gemini chưa trả về nội dung."
                : "Gemini chưa trả về nội dung.";
    }

    private String buildGroundedPrompt(String question, List<RagRetrievalService.RetrievedKnowledge> retrieved) {
        String context = retrieved.stream()
                .map(item -> """
                        [SOURCE id=%s type=%s title=%s score=%.3f]
                        %s
                        """.formatted(
                        item.getDocument().getId(),
                        item.getDocument().getSourceType(),
                        item.getDocument().getTitle(),
                        item.getScore(),
                        item.getDocument().getContent()
                ))
                .collect(Collectors.joining("\n"));

        return """
                Bạn là AI tư vấn của hệ thống showroom Porsche.
                Chỉ trả lời dựa trên CONTEXT nội bộ được cung cấp.
                Nếu context nội bộ có dữ liệu liên quan, hãy trả lời ngắn gọn, rõ ràng, bằng tiếng Việt có dấu.
                Không tự bịa giá, option, chính sách showroom, lịch lái thử hoặc thông tin tồn kho.
                Nếu một phần câu hỏi không có trong context, hãy nói rõ phần đó chưa có trong dữ liệu nội bộ.

                CONTEXT NỘI BỘ:
                %s

                CÂU HỎI:
                %s
                """.formatted(context, question);
    }

    private String buildGeneralKnowledgePrompt(String question, boolean carNotFoundInDatabase) {
        String prefixRule = carNotFoundInDatabase
                ? "Nếu câu hỏi hỏi về một mẫu xe hoặc hãng xe, hãy nói rõ: \"Tôi chưa tìm thấy mẫu xe này trong dữ liệu showroom; dưới đây là thông tin tham khảo theo kiến thức chung.\""
                : "Nếu câu hỏi không liên quan dữ liệu showroom, hãy trả lời tự nhiên theo kiến thức chung, không cần nhắc database.";

        return """
                Bạn là trợ lý AI tiếng Việt.
                Hãy trả lời bằng tiếng Việt có dấu, rõ ràng và hữu ích.
                Không tự nhận thông tin là dữ liệu nội bộ showroom nếu không có nguồn nội bộ.
                %s

                CÂU HỎI:
                %s
                """.formatted(prefixRule, question);
    }

    private Optional<AiChatResponse> answerCarModelQuestionFromDatabase(String message) {
        String normalizedMessage = normalizeText(message);
        if (normalizedMessage.length() < 3) {
            return Optional.empty();
        }

        List<CarModel> allModels = carModelRepository.findAll();
        List<CarModel> matches = allModels.stream()
                .filter(model -> model.getName() != null)
                .filter(model -> {
                    String normalizedName = normalizeText(model.getName());
                    return normalizedMessage.contains(normalizedName)
                            || normalizedName.contains(normalizedMessage)
                            || containsAllNameTokens(normalizedMessage, normalizedName);
                })
                .limit(5)
                .toList();

        if (matches.isEmpty()) {
            return Optional.empty();
        }

        boolean pricesLookLikeVnd = pricesLookLikeVnd(allModels);
        String answer = matches.stream()
                .map(model -> """
                        %s
                        - Dòng xe: %s
                        - Kiểu thân xe: %s
                        - Năm: %s
                        - Giá cơ bản: %s
                        - Nhiên liệu: %s
                        - Hộp số: %s
                        - Số ghế: %s
                        - Mô tả: %s
                        """.formatted(
                        model.getName(),
                        model.getSeries() != null ? valueOrUnknown(model.getSeries().getName()) : "chưa có dữ liệu",
                        model.getBodyType() != null ? valueOrUnknown(model.getBodyType().getName()) : "chưa có dữ liệu",
                        valueOrUnknown(model.getYear()),
                        model.getBasePrice() != null ? formatStoredPrice(model.getBasePrice(), pricesLookLikeVnd) : "chưa có dữ liệu",
                        valueOrUnknown(model.getFuelType()),
                        valueOrUnknown(model.getTransmission()),
                        valueOrUnknown(model.getSeats()),
                        valueOrUnknown(model.getShortDescription())
                ))
                .collect(Collectors.joining("\n"));

        return Optional.of(AiChatResponse.builder()
                .answer(answer.strip())
                .sources(matches.stream().map(this::carModelSource).toList())
                .confidence(0.95)
                .usedInternalKnowledge(true)
                .build());
    }

    private Optional<AiChatResponse> answerBudgetQuestionFromDatabase(String message) {
        Optional<BudgetQuery> budget = extractBudgetQuery(message);
        if (budget.isEmpty()) {
            return Optional.empty();
        }

        List<CarModel> activeModels = carModelRepository.findAll().stream()
                .filter(model -> !Boolean.FALSE.equals(model.getIsActive()))
                .filter(model -> model.getBasePrice() != null)
                .toList();
        if (activeModels.isEmpty()) {
            return Optional.empty();
        }

        boolean pricesLookLikeVnd = pricesLookLikeVnd(activeModels);
        BigDecimal targetPrice = toStoredCurrency(budget.get(), pricesLookLikeVnd);
        BigDecimal minPrice = targetPrice.multiply(BigDecimal.valueOf(0.8));
        BigDecimal maxPrice = targetPrice.multiply(BigDecimal.valueOf(1.2));

        List<CarModel> rangeModels = activeModels.stream()
                .filter(model -> model.getBasePrice().compareTo(minPrice) >= 0)
                .filter(model -> model.getBasePrice().compareTo(maxPrice) <= 0)
                .sorted((left, right) -> closestToTarget(left, right, targetPrice))
                .toList();
        BudgetIntent intent = detectBudgetIntent(message);
        List<CarModel> matchingModels = applyBudgetIntent(rangeModels, intent).stream()
                .limit(5)
                .toList();
        if (matchingModels.isEmpty() && intent != BudgetIntent.NONE) {
            matchingModels = rangeModels.stream().limit(5).toList();
        }

        if (matchingModels.isEmpty()) {
            String answer = "Hiện chưa tìm thấy mẫu xe nào trong khoảng "
                    + formatStoredPrice(minPrice, pricesLookLikeVnd)
                    + " đến "
                    + formatStoredPrice(maxPrice, pricesLookLikeVnd)
                    + " theo ngân sách bạn nhập. Bạn có thể thử mức ngân sách khác hoặc nêu rõ dòng xe mong muốn.";
            return Optional.of(buildDatabaseBudgetResponse(answer, List.of()));
        }

        String modelLines = matchingModels.stream()
                .map(model -> "- %s: giá cơ bản %s, nhiên liệu %s, hộp số %s, %s ghế".formatted(
                        model.getName(),
                        formatStoredPrice(model.getBasePrice(), pricesLookLikeVnd),
                        valueOrUnknown(model.getFuelType()),
                        valueOrUnknown(model.getTransmission()),
                        valueOrUnknown(model.getSeats())
                ))
                .collect(Collectors.joining("\n"));
        String answer = "Với ngân sách khoảng "
                + formatBudgetInput(budget.get())
                + ", tôi tìm trong khoảng chênh lệch ±20% và thấy các mẫu phù hợp:\n"
                + modelLines
                + "\nLưu ý: đây là giá cơ bản, chưa bao gồm option, phí và chính sách thực tế nếu hệ thống chưa lưu các khoản đó.";

        return Optional.of(buildDatabaseBudgetResponse(answer, matchingModels));
    }

    private AiChatResponse buildDatabaseBudgetResponse(String answer, List<CarModel> matchingModels) {
        return AiChatResponse.builder()
                .answer(answer)
                .sources(matchingModels.stream().map(this::carModelSource).toList())
                .confidence(matchingModels.isEmpty() ? 0.75 : 0.95)
                .usedInternalKnowledge(true)
                .build();
    }

    private Optional<BudgetQuery> extractBudgetQuery(String message) {
        String normalized = message.toLowerCase()
                .replace(",", ".")
                .replace("tỷ", "ty")
                .replace("tỉ", "ty");
        Matcher usdMatcher = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(usd|\\$|dollar|đô|do)").matcher(normalized);
        if (usdMatcher.find()) {
            return Optional.of(new BudgetQuery(new BigDecimal(usdMatcher.group(1)), true));
        }
        Matcher billionMatcher = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*ty").matcher(normalized);
        if (billionMatcher.find()) {
            return Optional.of(new BudgetQuery(new BigDecimal(billionMatcher.group(1)).multiply(BigDecimal.valueOf(1_000_000_000L)), false));
        }
        Matcher millionMatcher = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(trieu|triệu)").matcher(normalized);
        if (millionMatcher.find()) {
            return Optional.of(new BudgetQuery(new BigDecimal(millionMatcher.group(1)).multiply(BigDecimal.valueOf(1_000_000L)), false));
        }
        return Optional.empty();
    }

    private BigDecimal toStoredCurrency(BudgetQuery budget, boolean pricesLookLikeVnd) {
        if (budget.usd()) {
            return pricesLookLikeVnd
                    ? budget.amount().multiply(BigDecimal.valueOf(25_000L))
                    : budget.amount();
        }
        return pricesLookLikeVnd
                ? budget.amount()
                : budget.amount().divide(BigDecimal.valueOf(25_000L), 2, RoundingMode.HALF_UP);
    }

    private int closestToTarget(CarModel left, CarModel right, BigDecimal targetPrice) {
        BigDecimal leftDistance = left.getBasePrice().subtract(targetPrice).abs();
        BigDecimal rightDistance = right.getBasePrice().subtract(targetPrice).abs();
        return leftDistance.compareTo(rightDistance);
    }

    private BudgetIntent detectBudgetIntent(String message) {
        String normalized = normalizeText(message);
        if (normalized.contains("gia dinh")
                || normalized.contains("nhieu cho")
                || normalized.contains("5 cho")
                || normalized.contains("suv")
                || normalized.contains("gam cao")) {
            return BudgetIntent.FAMILY;
        }
        if (normalized.contains("di pho")
                || normalized.contains("xe pho")
                || normalized.contains("do thi")
                || normalized.contains("2 cho")
                || normalized.contains("coupe")
                || normalized.contains("roadster")) {
            return BudgetIntent.CITY;
        }
        return BudgetIntent.NONE;
    }

    private List<CarModel> applyBudgetIntent(List<CarModel> models, BudgetIntent intent) {
        if (intent == BudgetIntent.FAMILY) {
            return models.stream()
                    .filter(model -> model.getSeats() != null && model.getSeats() >= 5
                            || model.getBodyType() != null && normalizeText(model.getBodyType().getName()).contains("suv"))
                    .toList();
        }
        if (intent == BudgetIntent.CITY) {
            return models.stream()
                    .filter(model -> model.getSeats() != null && model.getSeats() <= 2
                            || model.getBodyType() != null && (
                            normalizeText(model.getBodyType().getName()).contains("coupe")
                                    || normalizeText(model.getBodyType().getName()).contains("roadster")))
                    .toList();
        }
        return models;
    }

    private boolean looksLikeCarQuestion(String message) {
        String normalized = normalizeText(message);
        List<String> vehicleTerms = List.of(
                "xe", "oto", "o to", "suv", "sedan", "coupe", "crossover", "hatchback",
                "porsche", "vinfast", "vanfast", "toyota", "honda", "bmw", "mercedes",
                "audi", "kia", "hyundai", "ford", "mazda", "tesla", "lexus"
        );
        return vehicleTerms.stream().anyMatch(term -> normalized.contains(term));
    }

    private boolean containsAllNameTokens(String normalizedMessage, String normalizedName) {
        String[] tokens = normalizedName.split("\\s+");
        for (String token : tokens) {
            if (token.length() > 1 && !normalizedMessage.contains(token)) {
                return false;
            }
        }
        return tokens.length > 0;
    }

    private String normalizeText(String value) {
        String noAccent = Normalizer.normalize(value.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return noAccent.replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean pricesLookLikeVnd(List<CarModel> models) {
        return models.stream()
                .map(CarModel::getBasePrice)
                .filter(Objects::nonNull)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO)
                .compareTo(BigDecimal.valueOf(1_000_000_000L)) >= 0;
    }

    private String formatVndBudget(BigDecimal value) {
        BigDecimal billion = value.divide(BigDecimal.valueOf(1_000_000_000L), 1, RoundingMode.HALF_UP);
        return billion.stripTrailingZeros().toPlainString() + " tỷ đồng";
    }

    private String formatBudgetInput(BudgetQuery budget) {
        if (budget.usd()) {
            return budget.amount().stripTrailingZeros().toPlainString() + " USD";
        }
        return formatVndBudget(budget.amount());
    }

    private String formatStoredPrice(BigDecimal value, boolean pricesLookLikeVnd) {
        if (pricesLookLikeVnd) {
            return value.divide(BigDecimal.valueOf(1_000_000_000L), 2, RoundingMode.HALF_UP)
                    .stripTrailingZeros()
                    .toPlainString() + " tỷ đồng";
        }
        return value.stripTrailingZeros().toPlainString() + " USD";
    }

    private String valueOrUnknown(Object value) {
        return value == null ? "chưa có dữ liệu" : value.toString();
    }

    private AiSourceDto carModelSource(CarModel model) {
        return AiSourceDto.builder()
                .id(model.getId())
                .title(model.getName())
                .sourceType("DATABASE_CAR_MODEL")
                .sourceRef(model.getId().toString())
                .imageUrl(defaultImageUrl(model.getId()))
                .score(1.0)
                .build();
    }

    private String defaultImageUrl(Long carModelId) {
        List<CarImage> images = carImageRepository.findByCarModelIdOrderBySortOrderAsc(carModelId);
        return images.stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsDefault()))
                .findFirst()
                .or(() -> images.stream().findFirst())
                .map(CarImage::getImageUrl)
                .orElse(null);
    }

    private String rootErrorMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        String message = current.getMessage();
        return StringUtils.hasText(message) ? message : current.getClass().getSimpleName();
    }

    private AiSourceDto toSource(RagRetrievalService.RetrievedKnowledge item) {
        KnowledgeDocument document = item.getDocument();
        return AiSourceDto.builder()
                .id(document.getId())
                .title(document.getTitle())
                .sourceType(document.getSourceType())
                .sourceRef(document.getSourceRef())
                .score(round(item.getScore()))
                .build();
    }

    private Double confidence(List<RagRetrievalService.RetrievedKnowledge> retrieved) {
        return retrieved.stream()
                .map(RagRetrievalService.RetrievedKnowledge::getScore)
                .max(Double::compareTo)
                .map(this::round)
                .orElse(0.20);
    }

    private Double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record BudgetQuery(BigDecimal amount, boolean usd) {
    }

    private enum BudgetIntent {
        NONE,
        FAMILY,
        CITY
    }
}
