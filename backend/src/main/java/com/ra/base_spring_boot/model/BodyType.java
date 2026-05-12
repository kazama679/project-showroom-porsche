package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "body_types")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BodyType extends BaseCreatedObject
{
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
