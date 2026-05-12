package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormCarModel;
import com.ra.base_spring_boot.dto.resp.CarModelResponseDTO;
import com.ra.base_spring_boot.exception.HttpConflict;
import com.ra.base_spring_boot.exception.HttpNotFound;
import com.ra.base_spring_boot.model.BodyType;
import com.ra.base_spring_boot.model.CarModel;
import com.ra.base_spring_boot.model.CarSeries;
import com.ra.base_spring_boot.repository.IBodyTypeRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.repository.ICarSeriesRepository;
import com.ra.base_spring_boot.services.ICarModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarModelServiceImpl implements ICarModelService
{
    private final ICarModelRepository carModelRepository;
    private final ICarSeriesRepository carSeriesRepository;
    private final IBodyTypeRepository bodyTypeRepository;

    @Override
    public Page<CarModelResponseDTO> findAll(String keyword, Long seriesId, Pageable pageable)
    {
        Page<CarModel> page;
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        
        if (seriesId != null) {
            if (hasKeyword) {
                page = carModelRepository.findBySeries_IdAndNameContainingIgnoreCase(seriesId, keyword, pageable);
            } else {
                page = carModelRepository.findBySeries_Id(seriesId, pageable);
            }
        } else {
            if (hasKeyword) {
                page = carModelRepository.findByNameContainingIgnoreCase(keyword, pageable);
            } else {
                page = carModelRepository.findAll(pageable);
            }
        }
        return page.map(CarModelResponseDTO::fromEntity);
    }

    @Override
    public CarModelResponseDTO findById(Long id)
    {
        CarModel entity = carModelRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Car model not found with id: " + id));
        return CarModelResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public CarModelResponseDTO create(FormCarModel form)
    {
        boolean exists = carModelRepository.findAll()
                .stream()
                .anyMatch(m -> m.getName().equalsIgnoreCase(form.getName()));

        if (exists)
        {
            throw new HttpConflict("Car model name already exists");
        }

        CarSeries series = carSeriesRepository.findById(form.getSeriesId())
                .orElseThrow(() -> new HttpNotFound("Car series not found with id: " + form.getSeriesId()));

        BodyType bodyType = bodyTypeRepository.findById(form.getBodyTypeId())
                .orElseThrow(() -> new HttpNotFound("Body type not found with id: " + form.getBodyTypeId()));

        CarModel entity = CarModel.builder()
                .name(form.getName())
                .year(form.getYear())
                .basePrice(form.getBasePrice())
                .shortDescription(form.getShortDescription())
                .fuelType(form.getFuelType())
                .transmission(form.getTransmission())
                .seats(form.getSeats())
                .isActive(form.getIsActive() != null ? form.getIsActive() : true)
                .series(series)
                .bodyType(bodyType)
                .build();

        return CarModelResponseDTO.fromEntity(carModelRepository.save(entity));
    }

    @Override
    @Transactional
    public CarModelResponseDTO update(Long id, FormCarModel form)
    {
        CarModel oldModel = carModelRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Car model not found with id: " + id));

        boolean exists = carModelRepository.findAll()
                .stream()
                .anyMatch(m -> !m.getId().equals(id)
                        && m.getName().equalsIgnoreCase(form.getName()));

        if (exists)
        {
            throw new HttpConflict("Car model name already exists");
        }

        CarSeries series = carSeriesRepository.findById(form.getSeriesId())
                .orElseThrow(() -> new HttpNotFound("Car series not found with id: " + form.getSeriesId()));

        BodyType bodyType = bodyTypeRepository.findById(form.getBodyTypeId())
                .orElseThrow(() -> new HttpNotFound("Body type not found with id: " + form.getBodyTypeId()));

        oldModel.setName(form.getName());
        oldModel.setYear(form.getYear());
        oldModel.setBasePrice(form.getBasePrice());
        oldModel.setShortDescription(form.getShortDescription());
        oldModel.setFuelType(form.getFuelType());
        oldModel.setTransmission(form.getTransmission());
        oldModel.setSeats(form.getSeats());
        oldModel.setIsActive(form.getIsActive());
        oldModel.setSeries(series);
        oldModel.setBodyType(bodyType);

        return CarModelResponseDTO.fromEntity(carModelRepository.save(oldModel));
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        CarModel carModel = carModelRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Car model not found with id: " + id));

        carModelRepository.delete(carModel);
    }
}
