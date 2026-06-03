package com.ra.base_spring_boot.ai;

import com.ra.base_spring_boot.entity.CarModel;
import com.ra.base_spring_boot.entity.CarModelOption;
import com.ra.base_spring_boot.entity.ShowroomLocation;
import com.ra.base_spring_boot.entity.VehicleListing;
import com.ra.base_spring_boot.repository.ICarModelOptionRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.repository.IVehicleListingRepository;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RagIngestionService {
    private static final List<String> SYSTEM_SOURCE_TYPES = List.of(
            "CAR_MODEL",
            "CAR_OPTION",
            "SHOWROOM",
            "VEHICLE_LISTING"
    );

    private final KnowledgeDocumentRepository knowledgeDocumentRepository;
    private final ICarModelRepository carModelRepository;
    private final ICarModelOptionRepository carModelOptionRepository;
    private final ShowroomLocationRepository showroomLocationRepository;
    private final IVehicleListingRepository vehicleListingRepository;
    private final EmbeddingModel embeddingModel;
    private final RagRetrievalService ragRetrievalService;

    @Transactional
    public KnowledgeDocumentResponse addAdminDocument(KnowledgeDocumentRequest request) {
        KnowledgeDocument document = KnowledgeDocument.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .sourceType(StringUtils.hasText(request.getSourceType()) ? request.getSourceType() : "ADMIN_FAQ")
                .sourceRef("admin")
                .indexed(false)
                .build();
        return toResponse(indexAndSave(document));
    }

    @Transactional(readOnly = true)
    public List<KnowledgeDocumentResponse> findAll() {
        return knowledgeDocumentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public int reindexAll() {
        knowledgeDocumentRepository.deleteBySourceTypeIn(SYSTEM_SOURCE_TYPES);
        indexCarModels();
        indexShowrooms();
        indexVehicleListings();

        knowledgeDocumentRepository.findBySourceTypeOrderByUpdatedAtDesc("ADMIN_FAQ")
                .forEach(this::indexAndSave);
        return knowledgeDocumentRepository.findByIndexedTrueAndEmbeddingJsonIsNotNull().size();
    }

    private void indexCarModels() {
        carModelRepository.findAll().forEach(model -> {
            if (Boolean.FALSE.equals(model.getIsActive())) {
                return;
            }
            upsertSystemDocument(
                    "CAR_MODEL",
                    model.getId().toString(),
                    "Model: " + model.getName(),
                    carModelContent(model)
            );

            List<CarModelOption> options = carModelOptionRepository.findByCarModelIdWithDetails(model.getId());
            options.forEach(option -> upsertSystemDocument(
                    "CAR_OPTION",
                    option.getId().toString(),
                    "Option: " + model.getName() + " - " + option.getOptionItem().getName(),
                    optionContent(model, option)
            ));
        });
    }

    private void indexShowrooms() {
        showroomLocationRepository.findAll().forEach(showroom -> {
            if (Boolean.FALSE.equals(showroom.getIsActive())) {
                return;
            }
            upsertSystemDocument(
                    "SHOWROOM",
                    showroom.getId().toString(),
                    "Showroom: " + showroom.getName(),
                    showroomContent(showroom)
            );
        });
    }

    private void indexVehicleListings() {
        vehicleListingRepository.findByStatusOrderByCreatedAtDesc("APPROVED").forEach(listing ->
                upsertSystemDocument(
                        "VEHICLE_LISTING",
                        listing.getId().toString(),
                        "Vehicle listing: " + safe(listing.getMake()) + " " + safe(listing.getModel()),
                        vehicleListingContent(listing)
                )
        );
    }

    private void upsertSystemDocument(String sourceType, String sourceRef, String title, String content) {
        KnowledgeDocument document = knowledgeDocumentRepository
                .findBySourceTypeAndSourceRef(sourceType, sourceRef)
                .orElseGet(KnowledgeDocument::new);
        document.setSourceType(sourceType);
        document.setSourceRef(sourceRef);
        document.setTitle(title);
        document.setContent(content);
        indexAndSave(document);
    }

    private KnowledgeDocument indexAndSave(KnowledgeDocument document) {
        document.setEmbeddingJson(ragRetrievalService.toJson(embeddingModel.embed(document.getContent()).content()));
        document.setIndexed(true);
        return knowledgeDocumentRepository.save(document);
    }

    private KnowledgeDocumentResponse toResponse(KnowledgeDocument document) {
        return KnowledgeDocumentResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .content(document.getContent())
                .sourceType(document.getSourceType())
                .sourceRef(document.getSourceRef())
                .indexed(document.getIndexed())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    private String carModelContent(CarModel model) {
        String series = model.getSeries() != null ? model.getSeries().getName() : "";
        String bodyType = model.getBodyType() != null ? model.getBodyType().getName() : "";
        return """
                Loai du lieu: model xe Porsche noi bo.
                Model: %s
                Series: %s
                Body type: %s
                Nam: %s
                Gia co ban: %s
                Nhien lieu: %s
                Hop so: %s
                So ghe: %s
                Mo ta: %s
                """.formatted(
                safe(model.getName()),
                safe(series),
                safe(bodyType),
                safe(model.getYear()),
                money(model.getBasePrice()),
                safe(model.getFuelType()),
                safe(model.getTransmission()),
                safe(model.getSeats()),
                safe(model.getShortDescription())
        );
    }

    private String optionContent(CarModel model, CarModelOption option) {
        var item = option.getOptionItem();
        var group = item.getOptionGroup();
        var category = group != null ? group.getCategory() : null;
        return """
                Loai du lieu: option cau hinh noi bo.
                Model: %s
                Option: %s
                Nhom option: %s
                Danh muc: %s
                Gia option: %s
                Mac dinh theo model: %s
                Mo ta option: %s
                """.formatted(
                safe(model.getName()),
                safe(item.getName()),
                group != null ? safe(group.getName()) : "",
                category != null ? safe(category.getName()) : "",
                money(item.getPrice()),
                Boolean.TRUE.equals(option.getIsDefault()) ? "co" : "khong",
                safe(item.getDescription())
        );
    }

    private String showroomContent(ShowroomLocation showroom) {
        return """
                Loai du lieu: showroom noi bo.
                Showroom: %s
                Dia chi: %s
                Thanh pho: %s
                Dien thoai: %s
                Gio mo cua: %s
                """.formatted(
                safe(showroom.getName()),
                safe(showroom.getAddress()),
                safe(showroom.getCity()),
                safe(showroom.getPhone()),
                safe(showroom.getOpeningHours())
        );
    }

    private String vehicleListingContent(VehicleListing listing) {
        return """
                Loai du lieu: xe dang ban da duyet.
                Hang: %s
                Model: %s
                Trim: %s
                Nam: %s
                Gia chao ban: %s
                Nhien lieu: %s
                Hop so: %s
                So ghe: %s
                Mau ngoai that: %s
                Mau noi that: %s
                Tinh trang cong khai: %s
                """.formatted(
                safe(listing.getMake()),
                safe(listing.getModel()),
                safe(listing.getTrimLevel()),
                safe(listing.getModelYear()),
                money(listing.getAskingPrice()),
                safe(listing.getFuelType()),
                safe(listing.getTransmission()),
                safe(listing.getSeats()),
                safe(listing.getExteriorColor()),
                safe(listing.getInteriorColor()),
                safe(listing.getConditionDescription())
        );
    }

    private String money(BigDecimal value) {
        return value == null ? "chua co du lieu" : value.toPlainString();
    }

    private String safe(Object value) {
        return value == null ? "chua co du lieu" : value.toString();
    }
}
