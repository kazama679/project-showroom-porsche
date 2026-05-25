package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.dto.request.InquiryRequest;
import com.ra.base_spring_boot.entity.ContactInquiry;
import com.ra.base_spring_boot.repository.IContactInquiryRepository;
import com.ra.base_spring_boot.service.IInquiryService;
import com.ra.base_spring_boot.service.impl.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InquiryServiceImpl implements IInquiryService {

    private final IContactInquiryRepository contactInquiryRepository;
    private final MailService mailService;

    @Override
    public ContactInquiry createInquiry(InquiryRequest request, Long carOptionId, String carImageUrl) {
        ContactInquiry inquiry = ContactInquiry.builder()
                .salutation(request.getSalutation())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .countryCode(request.getCountryCode())
                .phoneNumber(request.getPhoneNumber())
                .message(request.getMessage())
                .dealerName(request.getDealerName())
                .dealerAddress(request.getDealerAddress())
                .porscheCode(request.getPorscheCode())
                .carName(request.getCarName())
                .carPrice(request.getCarPrice())
                .basePrice(request.getBasePrice())
                .createdAt(LocalDateTime.now())
                .build();

        ContactInquiry saved = contactInquiryRepository.save(inquiry);

        // Run email asynchronously to avoid blocking user response
        new Thread(() -> {
            try {
                mailService.sendInquiryEmail(
                        saved.getEmail(),
                        saved.getDealerName(),
                        saved.getDealerAddress(),
                        saved.getCarName(),
                        saved.getPorscheCode(),
                        saved.getCarPrice(),
                        saved.getMessage(),
                        carImageUrl,
                        carOptionId
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        return saved;
    }
}
