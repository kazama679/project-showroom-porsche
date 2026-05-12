package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "showroom_locations")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ShowroomLocation extends BaseCreatedObject
{
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "city", nullable = false, length = 150)
    private String city;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "opening_hours", length = 255)
    private String openingHours;

    @Column(name = "is_active")
    private Boolean isActive;
}
