package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blog_categories")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BlogCategory extends BaseCreatedObject
{
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", unique = true, length = 255)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private BlogCategory parent;
}
