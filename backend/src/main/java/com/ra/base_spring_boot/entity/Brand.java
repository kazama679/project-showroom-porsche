package com.ra.base_spring_boot.entity;

import com.ra.base_spring_boot.common.base.BaseObject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "brands")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Brand extends BaseObject
{
    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;
}
