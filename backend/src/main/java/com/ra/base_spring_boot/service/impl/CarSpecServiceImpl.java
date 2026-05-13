package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.req.*;
import com.ra.base_spring_boot.model.*;
import com.ra.base_spring_boot.repository.*;
import com.ra.base_spring_boot.service.CarSpecService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CarSpecServiceImpl implements CarSpecService {

    private final CarPerformanceSpecRepository performanceSpecRepository;
    private final CarEngineSpecRepository engineSpecRepository;
    private final CarElectricSpecRepository electricSpecRepository;
    private final ICarModelRepository carModelRepository;

    @Override
    public CarSpecsDTO getSpecsByCarModelId(Long carModelId) {
        CarPerformanceSpec perfSpec = performanceSpecRepository.findByCarModelId(carModelId).orElse(null);
        CarEngineSpec engSpec = engineSpecRepository.findByCarModelId(carModelId).orElse(null);
        CarElectricSpec elecSpec = electricSpecRepository.findByCarModelId(carModelId).orElse(null);

        return CarSpecsDTO.builder()
                .performance(perfSpec != null ? mapToPerfDTO(perfSpec) : null)
                .engine(engSpec != null ? mapToEngDTO(engSpec) : null)
                .electric(elecSpec != null ? mapToElecDTO(elecSpec) : null)
                .build();
    }

    @Override
    @Transactional
    public CarSpecsDTO saveSpecs(Long carModelId, CarSpecsDTO specsDTO) {
        CarModel carModel = carModelRepository.findById(carModelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car Model not found"));

        if (specsDTO.getPerformance() != null) {
            CarPerformanceSpec perfSpec = performanceSpecRepository.findByCarModelId(carModelId).orElse(new CarPerformanceSpec());
            perfSpec.setCarModel(carModel);
            perfSpec.setHorsepower(specsDTO.getPerformance().getHorsepower());
            perfSpec.setAcceleration0100(specsDTO.getPerformance().getAcceleration0100());
            perfSpec.setTopSpeed(specsDTO.getPerformance().getTopSpeed());
            performanceSpecRepository.save(perfSpec);
        } else {
            performanceSpecRepository.findByCarModelId(carModelId).ifPresent(performanceSpecRepository::delete);
        }

        if (specsDTO.getEngine() != null) {
            CarEngineSpec engSpec = engineSpecRepository.findByCarModelId(carModelId).orElse(new CarEngineSpec());
            engSpec.setCarModel(carModel);
            engSpec.setEngineType(specsDTO.getEngine().getEngineType());
            engSpec.setDrivetrain(specsDTO.getEngine().getDrivetrain());
            engSpec.setFuelConsumption(specsDTO.getEngine().getFuelConsumption());
            engineSpecRepository.save(engSpec);
        } else {
            engineSpecRepository.findByCarModelId(carModelId).ifPresent(engineSpecRepository::delete);
        }

        if (specsDTO.getElectric() != null) {
            CarElectricSpec elecSpec = electricSpecRepository.findByCarModelId(carModelId).orElse(new CarElectricSpec());
            elecSpec.setCarModel(carModel);
            elecSpec.setRangeKm(specsDTO.getElectric().getRangeKm());
            elecSpec.setBatteryCapacity(specsDTO.getElectric().getBatteryCapacity());
            elecSpec.setChargingTime(specsDTO.getElectric().getChargingTime());
            electricSpecRepository.save(elecSpec);
        } else {
            electricSpecRepository.findByCarModelId(carModelId).ifPresent(electricSpecRepository::delete);
        }

        return getSpecsByCarModelId(carModelId);
    }

    private CarPerformanceSpecDTO mapToPerfDTO(CarPerformanceSpec entity) {
        return CarPerformanceSpecDTO.builder()
                .id(entity.getId())
                .carModelId(entity.getCarModel().getId())
                .horsepower(entity.getHorsepower())
                .acceleration0100(entity.getAcceleration0100())
                .topSpeed(entity.getTopSpeed())
                .build();
    }

    private CarEngineSpecDTO mapToEngDTO(CarEngineSpec entity) {
        return CarEngineSpecDTO.builder()
                .id(entity.getId())
                .carModelId(entity.getCarModel().getId())
                .engineType(entity.getEngineType())
                .drivetrain(entity.getDrivetrain())
                .fuelConsumption(entity.getFuelConsumption())
                .build();
    }

    private CarElectricSpecDTO mapToElecDTO(CarElectricSpec entity) {
        return CarElectricSpecDTO.builder()
                .id(entity.getId())
                .carModelId(entity.getCarModel().getId())
                .rangeKm(entity.getRangeKm())
                .batteryCapacity(entity.getBatteryCapacity())
                .chargingTime(entity.getChargingTime())
                .build();
    }
}
