package com.ra.base_spring_boot.services;

import org.springframework.web.multipart.MultipartFile;

public interface ICloudinaryService {
    String uploadFile(MultipartFile file);
    String uploadVideo(MultipartFile file);
}
