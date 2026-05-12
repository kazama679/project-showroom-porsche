package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormCarImage;
import com.ra.base_spring_boot.dto.resp.CarImageResponseDTO;
import com.ra.base_spring_boot.exception.HttpNotFound;
import com.ra.base_spring_boot.model.CarImage;
import com.ra.base_spring_boot.model.CarModel;
import com.ra.base_spring_boot.repository.ICarImageRepository;
import com.ra.base_spring_boot.repository.ICarModelRepository;
import com.ra.base_spring_boot.services.ICarImageService;
import com.ra.base_spring_boot.services.ICloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarImageServiceImpl implements ICarImageService
{
    private final ICarImageRepository carImageRepository;
    private final ICarModelRepository carModelRepository;
    private final ICloudinaryService cloudinaryService;

    @Override
    public Page<CarImageResponseDTO> findAll(String keyword, Pageable pageable)
    {
        Page<CarImage> page;
        if (keyword == null || keyword.trim().isEmpty())
        {
            page = carImageRepository.findAll(pageable);
        }
        else
        {
            page = carImageRepository.findByImageTypeContainingIgnoreCase(keyword, pageable);
        }
        return page.map(CarImageResponseDTO::fromEntity);
    }

    @Override
    public CarImageResponseDTO findById(Long id)
    {
        CarImage entity = carImageRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Car image not found with id: " + id));
        return CarImageResponseDTO.fromEntity(entity);
    }

    @Override
    @Transactional
    public CarImageResponseDTO create(FormCarImage form)
    {
        CarModel carModel = carModelRepository.findById(form.getCarModelId())
                .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + form.getCarModelId()));

        String imageUrl = null;
        if (form.getImage() != null && !form.getImage().isEmpty()) {
            imageUrl = cloudinaryService.uploadFile(form.getImage());
        }

        CarImage entity = CarImage.builder()
                .imageUrl(imageUrl)
                .imageType(form.getImageType())
                .sortOrder(form.getSortOrder())
                .isDefault(form.getIsDefault() != null ? form.getIsDefault() : false)
                .carModel(carModel)
                .build();

        return CarImageResponseDTO.fromEntity(carImageRepository.save(entity));
    }

    @Override
    @Transactional
    public CarImageResponseDTO update(Long id, FormCarImage form)
    {
        CarImage oldImage = carImageRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Car image not found with id: " + id));

        CarModel carModel = carModelRepository.findById(form.getCarModelId())
                .orElseThrow(() -> new HttpNotFound("Car model not found with id: " + form.getCarModelId()));

        if (form.getImage() != null && !form.getImage().isEmpty()) {
            oldImage.setImageUrl(cloudinaryService.uploadFile(form.getImage()));
        }
        
        oldImage.setImageType(form.getImageType());
        oldImage.setSortOrder(form.getSortOrder());
        oldImage.setIsDefault(form.getIsDefault());
        oldImage.setCarModel(carModel);

        return CarImageResponseDTO.fromEntity(carImageRepository.save(oldImage));
    }

    @Override
    @Transactional
    public void delete(Long id)
    {
        CarImage carImage = carImageRepository.findById(id)
                .orElseThrow(() ->
                        new HttpNotFound("Car image not found with id: " + id));

        carImageRepository.delete(carImage);
    }
}
