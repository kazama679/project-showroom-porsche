package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.CarBuildRequest;
import com.ra.base_spring_boot.dto.response.CarBuildResponse;
import com.ra.base_spring_boot.entity.User;

import java.util.List;

public interface ICarBuildService {
    CarBuildResponse saveBuild(CarBuildRequest request, User user);
    List<CarBuildResponse> getUserBuilds(User user);
    void deleteBuild(Long id, User user);
    CarBuildResponse getBuildByCode(String porscheCode);
}
