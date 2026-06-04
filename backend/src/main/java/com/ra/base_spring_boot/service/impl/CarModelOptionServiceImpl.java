package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.FormCarModelOption;
import com.ra.base_spring_boot.dto.response.CarModelOptionResponseDTO;
import com.ra.base_spring_boot.common.exception.HttpConflict;
import com.ra.base_spring_boot.common.exception.HttpNotFound;
import com.ra.base_spring_boot.entity.CarModel;
import com.ra.base_spring_boot.entity.CarModelOption;
import com.ra.base_spring_boot.entity.OptionItem;
import com.ra.base_spring_boot.repository.ICarModelOptionRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.repository.IOptionItemRepository;
import com.ra.base_spring_boot.service.ICarModelOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarModelOptionServiceImpl implements ICarModelOptionService {
    private final ICarModelOptionRepository carModelOptionRepository;
    private final ICarModelRepository carModelRepository;
    private final IOptionItemRepository optionItemRepository;

    @Override
    public Page<CarModelOptionResponseDTO> findAll(String keyword, Long carModelId, Pageable pageable) {
        Page<CarModelOption> page;
        if (carModelId != null) {
            String kw = keyword == null ? "" : keyword.trim();
            page = carModelOptionRepository.findByCarModelIdAndKeyword(carModelId, kw, pageable);
        } else if (keyword == null || keyword.trim().isEmpty()) {
            page = carModelOptionRepository.findAll(pageable);
        } else {
            page = carModelOptionRepository.findByKeyword(keyword, pageable);
        }
        return page.map(CarModelOptionResponseDTO::fromEntity);
    }

    @Override
    public Page<CarModelOptionResponseDTO> findByCarModelId(Long carModelId, String keyword, Pageable pageable) {
        String kw = keyword == null ? "" : keyword.trim();
        Page<CarModelOption> page = carModelOptionRepository.findByCarModelIdAndKeyword(carModelId, kw, pageable);
        return page.map(CarModelOptionResponseDTO::fromEntity);
    }

    @Override
    public CarModelOptionResponseDTO findById(Long id) {
        CarModelOption entity = carModelOptionRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Car model option not found with id: " + id));
        return CarModelOptionResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public CarModelOptionResponseDTO create(FormCarModelOption form) {
        CarModel carModel = carModelRepository.findById(form.getCarModelId())
                .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + form.getCarModelId()));

        OptionItem optionItem = optionItemRepository.findById(form.getOptionItemId())
                .orElseThrow(() -> new HttpNotFound("Option item not found with id: " + form.getOptionItemId()));

        boolean exists = carModelOptionRepository.findAll()
                .stream()
                .anyMatch(o -> o.getCarModel().getId().equals(form.getCarModelId())
                        && o.getOptionItem().getId().equals(form.getOptionItemId()));

        if (exists) {
            throw new HttpConflict("This option is already assigned to this car model");
        }

        CarModelOption entity = CarModelOption.builder()
                .carModel(carModel)
                .optionItem(optionItem)
                .isDefault(form.getIsDefault() != null ? form.getIsDefault() : false)
                .build();

        return CarModelOptionResponseDTO.fromEntity(carModelOptionRepository.save(entity));
    }

    @Override
    @Transactional
    public CarModelOptionResponseDTO update(Long id, FormCarModelOption form) {
        CarModelOption oldEntity = carModelOptionRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Car model option not found with id: " + id));

        CarModel carModel = carModelRepository.findById(form.getCarModelId())
                .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + form.getCarModelId()));

        OptionItem optionItem = optionItemRepository.findById(form.getOptionItemId())
                .orElseThrow(() -> new HttpNotFound("Option item not found with id: " + form.getOptionItemId()));

        boolean exists = carModelOptionRepository.findAll()
                .stream()
                .anyMatch(o -> !o.getId().equals(id)
                        && o.getCarModel().getId().equals(form.getCarModelId())
                        && o.getOptionItem().getId().equals(form.getOptionItemId()));

        if (exists) {
            throw new HttpConflict("This option is already assigned to this car model");
        }

        oldEntity.setCarModel(carModel);
        oldEntity.setOptionItem(optionItem);
        oldEntity.setIsDefault(form.getIsDefault() != null ? form.getIsDefault() : false);

        return CarModelOptionResponseDTO.fromEntity(carModelOptionRepository.save(oldEntity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CarModelOption entity = carModelOptionRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Car model option not found with id: " + id));

        carModelOptionRepository.delete(entity);
    }
}
