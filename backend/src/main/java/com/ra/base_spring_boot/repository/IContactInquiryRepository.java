package com.ra.base_spring_boot.repository;

import com.ra.base_spring_boot.entity.ContactInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
}
