package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.FormCarSeries;
import com.ra.base_spring_boot.dto.response.CarSeriesResponseDTO;
import com.ra.base_spring_boot.common.exception.HttpConflict;
import com.ra.base_spring_boot.common.exception.HttpNotFound;
import com.ra.base_spring_boot.entity.Brand;
import com.ra.base_spring_boot.entity.CarSeries;
import com.ra.base_spring_boot.repository.IBrandRepository;
import com.ra.base_spring_boot.repository.ICarSeriesRepository;
import com.ra.base_spring_boot.service.ICarSeriesService;
import com.ra.base_spring_boot.service.ICloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarSeriesServiceImpl implements ICarSeriesService
{
    private final ICarSeriesRepository carSeriesRepository;
    private final IBrandRepository brandRepository;
    private final ICloudinaryService cloudinaryService;

    @Override
    public Page<CarSeriesResponseDTO> findAll(String keyword, Pageable pageable)
    {
        Page<CarSeries> page;
        if (keyword == null || keyword.trim().isEmpty())
        {
            page = carSeriesRepository.findAll(pageable);
        }
        else
        {
            page = carSeriesRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }
        return page.map(CarSeriesResponseDTO::fromEntity);
    }

    @Override
    public CarSeriesResponseDTO findById(Long id)
    {
        CarSeries entity = carSeriesRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Car series not found with id: " + id));
        return CarSeriesResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public CarSeriesResponseDTO create(FormCarSeries form)
    {
        boolean exists = carSeriesRepository.findAll()
                .stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(form.getName()));

        if (exists)
        {
            throw new HttpConflict("Car series name already exists");
        }

        Brand brand = brandRepository.findById(form.getBrandId())
                .orElseThrow(() -> new HttpNotFound("Brand not found with id: " + form.getBrandId()));

        String imageUrl = null;
        if (form.getImage() != null && !form.getImage().isEmpty()) {
            imageUrl = cloudinaryService.uploadFile(form.getImage());
        }

        String videoUrl = null;
        if (form.getVideo() != null && !form.getVideo().isEmpty()) {
            videoUrl = cloudinaryService.uploadVideo(form.getVideo());
        }

        CarSeries entity = CarSeries.builder()
                .name(form.getName())
                .description(form.getDescription())
                .isActive(form.getIsActive() != null ? form.getIsActive() : true)
                .brand(brand)
                .imageUrl(imageUrl)
                .videoUrl(videoUrl)
                .build();

        return CarSeriesResponseDTO.fromEntity(carSeriesRepository.save(entity));
    }

    @Override
    @Transactional
    public CarSeriesResponseDTO update(Long id, FormCarSeries form)
    {
        CarSeries oldSeries = carSeriesRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Car series not found with id: " + id));

        boolean exists = carSeriesRepository.findAll()
                .stream()
                .anyMatch(s -> !s.getId().equals(id)
                        && s.getName().equalsIgnoreCase(form.getName()));

        if (exists)
        {
            throw new HttpConflict("Car series name already exists");
        }

        Brand brand = brandRepository.findById(form.getBrandId())
                .orElseThrow(() -> new HttpNotFound("Brand not found with id: " + form.getBrandId()));

        oldSeries.setName(form.getName());
        oldSeries.setDescription(form.getDescription());
        oldSeries.setIsActive(form.getIsActive());
        oldSeries.setBrand(brand);

        if (form.getImage() != null && !form.getImage().isEmpty()) {
            oldSeries.setImageUrl(cloudinaryService.uploadFile(form.getImage()));
        }

        if (form.getVideo() != null && !form.getVideo().isEmpty()) {
            oldSeries.setVideoUrl(cloudinaryService.uploadVideo(form.getVideo()));
        }

        return CarSeriesResponseDTO.fromEntity(carSeriesRepository.save(oldSeries));
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        CarSeries entity = carSeriesRepository.findById(id)
                .orElseThrow(() -> new HttpNotFound("Car series not found with id: " + id));
        carSeriesRepository.delete(entity);
    }
}
