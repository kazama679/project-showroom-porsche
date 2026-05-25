package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.request.InquiryRequest;
import com.ra.base_spring_boot.entity.ContactInquiry;

public interface IInquiryService {
    ContactInquiry createInquiry(InquiryRequest request, Long carOptionId, String carImageUrl);
}
