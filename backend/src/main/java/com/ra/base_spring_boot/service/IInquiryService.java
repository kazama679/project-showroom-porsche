package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.dto.req.InquiryRequest;
import com.ra.base_spring_boot.model.ContactInquiry;

public interface IInquiryService {
    ContactInquiry createInquiry(InquiryRequest request, Long carOptionId, String carImageUrl);
}
