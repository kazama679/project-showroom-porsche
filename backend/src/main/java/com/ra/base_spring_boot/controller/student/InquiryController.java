package com.ra.base_spring_boot.controller.student;

import com.ra.base_spring_boot.dto.request.InquiryRequest;
import com.ra.base_spring_boot.entity.ContactInquiry;
import com.ra.base_spring_boot.service.IInquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
@CrossOrigin("*")
public class InquiryController {

    private final IInquiryService inquiryService;

    @PostMapping
    public ResponseEntity<?> submitInquiry(
            @Valid @RequestBody InquiryRequest request,
            @RequestParam(required = false) Long carOptionId,
            @RequestParam(required = false) String carImageUrl) {
        
        ContactInquiry inquiry = inquiryService.createInquiry(request, carOptionId, carImageUrl);
        return ResponseEntity.ok(inquiry);
    }
}
