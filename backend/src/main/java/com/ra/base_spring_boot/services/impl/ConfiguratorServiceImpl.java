package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.resp.*;
import com.ra.base_spring_boot.exception.HttpNotFound;
import com.ra.base_spring_boot.model.*;
import com.ra.base_spring_boot.repository.ICarImageRepository;
import com.ra.base_spring_boot.repository.ICarModelOptionRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.services.IConfiguratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConfiguratorServiceImpl implements IConfiguratorService
{
    private static final BigDecimal DEFAULT_DELIVERY_FEE = new BigDecimal("2350");

    private static final String FALLBACK_WHEEL_IMAGE =
            "https://res.cloudinary.com/dfireq2op/image/upload/v1778661086/porsche/9abe3dfc-d98a-42d1-806e-49da8a25ca8d.avif";
    private static final String FALLBACK_PAINT_IMAGE =
            "https://res.cloudinary.com/dfireq2op/image/upload/v1778648038/porsche/cfa3dfd5-c8d8-4a51-869d-21584728d373.avif";
    private static final String FALLBACK_INTERIOR_IMAGE =
            "https://res.cloudinary.com/dfireq2op/image/upload/v1778661011/porsche/305482cb-a5b2-48cc-8c64-2826fdc29d3b.avif";
    private static final String FALLBACK_OPTION_IMAGE =
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png";

    private final ICarModelRepository carModelRepository;
    private final ICarModelOptionRepository carModelOptionRepository;
    private final ICarImageRepository carImageRepository;

    @Override
    @Transactional(readOnly = true)
    public ConfiguratorResponseDTO getByCarModelId(Long carModelId)
    {
        CarModel carModel = carModelRepository.findById(carModelId)
                .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + carModelId));

        List<CarModelOption> modelOptions = carModelOptionRepository.findByCarModelIdWithDetails(carModelId);

        List<ConfiguratorSectionDTO> sections = buildSections(modelOptions);
        Map<String, String> defaultSelections = buildDefaultSelections(sections);
        List<ConfiguratorGalleryImageDTO> galleryImages = buildGalleryImages(carModelId, carModel.getName());

        String imageUrl = galleryImages.isEmpty() ? null : galleryImages.get(0).getSrc();

        return ConfiguratorResponseDTO.builder()
                .id(carModel.getId())
                .name(carModel.getName())
                .year(carModel.getYear())
                .basePrice(carModel.getBasePrice())
                .deliveryFee(DEFAULT_DELIVERY_FEE)
                .imageUrl(imageUrl)
                .sections(sections)
                .galleryImages(galleryImages)
                .defaultSelections(defaultSelections)
                .build();
    }

    private List<ConfiguratorSectionDTO> buildSections(List<CarModelOption> modelOptions)
    {
        if (modelOptions.isEmpty())
        {
            return List.of();
        }

        Map<Long, List<CarModelOption>> byCategory = modelOptions.stream()
                .collect(Collectors.groupingBy(
                        cmo -> cmo.getOptionItem().getOptionGroup().getCategory().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<ConfiguratorSectionDTO> sections = new ArrayList<>();

        byCategory.entrySet().stream()
                .sorted(Comparator.comparingInt(e -> displayOrder(
                        e.getValue().get(0).getOptionItem().getOptionGroup().getCategory().getDisplayOrder())))
                .forEach(categoryEntry ->
                {
                    OptionCategory category = categoryEntry.getValue().get(0)
                            .getOptionItem().getOptionGroup().getCategory();

                    Map<Long, List<CarModelOption>> byGroup = categoryEntry.getValue().stream()
                            .collect(Collectors.groupingBy(
                                    cmo -> cmo.getOptionItem().getOptionGroup().getId(),
                                    LinkedHashMap::new,
                                    Collectors.toList()
                            ));

                    List<ConfiguratorSubGroupDTO> subGroups = byGroup.entrySet().stream()
                            .sorted(Comparator.comparingInt(e -> displayOrder(
                                    e.getValue().get(0).getOptionItem().getOptionGroup().getDisplayOrder())))
                            .map(groupEntry ->
                            {
                                OptionGroup group = groupEntry.getValue().get(0)
                                        .getOptionItem().getOptionGroup();

                                List<ConfiguratorOptionDTO> options = groupEntry.getValue().stream()
                                        .sorted(Comparator.comparing(cmo -> cmo.getOptionItem().getName()))
                                        .map(this::toOptionDto)
                                        .toList();

                                return ConfiguratorSubGroupDTO.builder()
                                        .id("group-" + group.getId())
                                        .title(group.getName())
                                        .options(options)
                                        .build();
                            })
                            .toList();

                    sections.add(ConfiguratorSectionDTO.builder()
                            .id("category-" + category.getId())
                            .title(category.getName())
                            .variant(resolveVariant(category.getName(), subGroups))
                            .subGroups(subGroups)
                            .build());
                });

        return sections;
    }

    private ConfiguratorOptionDTO toOptionDto(CarModelOption cmo)
    {
        OptionItem item = cmo.getOptionItem();
        BigDecimal price = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
        boolean isStandard = Boolean.TRUE.equals(cmo.getIsDefault())
                || price.compareTo(BigDecimal.ZERO) == 0;

        return ConfiguratorOptionDTO.builder()
                .id(String.valueOf(item.getId()))
                .code(String.valueOf(item.getId()))
                .name(item.getName())
                .description(item.getDescription())
                .price(price)
                .isStandard(isStandard)
                .imageUrl(resolveOptionImageUrl(item))
                .color(inferColorHex(item.getName()))
                .build();
    }

    private String resolveOptionImageUrl(OptionItem item)
    {
        if (item.getImageUrl() != null && !item.getImageUrl().isBlank())
        {
            return item.getImageUrl();
        }

        String groupName = item.getOptionGroup() != null ? item.getOptionGroup().getName() : "";
        String categoryName = item.getOptionGroup() != null && item.getOptionGroup().getCategory() != null
                ? item.getOptionGroup().getCategory().getName()
                : "";
        String combined = (groupName + " " + categoryName).toLowerCase();

        if (combined.contains("mâm") || combined.contains("wheel") || combined.contains("bánh"))
        {
            return FALLBACK_WHEEL_IMAGE;
        }
        if (combined.contains("sơn") || combined.contains("màu") || combined.contains("paint"))
        {
            return FALLBACK_PAINT_IMAGE;
        }
        if (combined.contains("ghế") || combined.contains("seat") || combined.contains("nội thất")
                || combined.contains("interior"))
        {
            return FALLBACK_INTERIOR_IMAGE;
        }
        return FALLBACK_OPTION_IMAGE;
    }

    private Map<String, String> buildDefaultSelections(List<ConfiguratorSectionDTO> sections)
    {
        Map<String, String> selections = new LinkedHashMap<>();

        for (ConfiguratorSectionDTO section : sections)
        {
            for (ConfiguratorSubGroupDTO subGroup : section.getSubGroups())
            {
                ConfiguratorOptionDTO selected = subGroup.getOptions().stream()
                        .filter(o -> Boolean.TRUE.equals(o.getIsStandard()))
                        .findFirst()
                        .orElse(subGroup.getOptions().isEmpty() ? null : subGroup.getOptions().get(0));

                if (selected != null)
                {
                    selections.put(subGroup.getId(), selected.getId());
                }
            }
        }

        return selections;
    }

    private List<ConfiguratorGalleryImageDTO> buildGalleryImages(Long carModelId, String modelName)
    {
        List<CarImage> images = carImageRepository.findByCarModelIdOrderBySortOrderAsc(carModelId);

        if (images.isEmpty())
        {
            return List.of();
        }

        return images.stream()
                .map(img -> ConfiguratorGalleryImageDTO.builder()
                        .id(String.valueOf(img.getId()))
                        .src(img.getImageUrl())
                        .alt(modelName)
                        .type(mapImageType(img.getImageType()))
                        .build())
                .toList();
    }

    private String resolveVariant(String categoryName, List<ConfiguratorSubGroupDTO> subGroups)
    {
        String combined = (categoryName + " " + subGroups.stream()
                .map(ConfiguratorSubGroupDTO::getTitle)
                .collect(Collectors.joining(" "))).toLowerCase();

        if (combined.contains("sơn") || combined.contains("màu") || combined.contains("color"))
        {
            return "color";
        }
        return "card";
    }

    private String inferColorHex(String name)
    {
        if (name == null)
        {
            return null;
        }
        String lower = name.toLowerCase();
        if (lower.contains("trắng") || lower.contains("white"))
        {
            return "#FFFFFF";
        }
        if (lower.contains("đen") || lower.contains("black"))
        {
            return "#1A1A1A";
        }
        if (lower.contains("đỏ") || lower.contains("red"))
        {
            return "#8B0000";
        }
        if (lower.contains("xanh") || lower.contains("blue"))
        {
            return "#1E3A5F";
        }
        if (lower.contains("bạc") || lower.contains("silver") || lower.contains("ghi"))
        {
            return "#C0C0C0";
        }
        return null;
    }

    private String mapImageType(String imageType)
    {
        if (imageType == null)
        {
            return "exterior";
        }
        String lower = imageType.toLowerCase();
        if (lower.contains("interior") || lower.contains("nội"))
        {
            return "interior";
        }
        if (lower.contains("detail"))
        {
            return "detail";
        }
        return "exterior";
    }

    private int displayOrder(Integer order)
    {
        return order != null ? order : Integer.MAX_VALUE;
    }
}
