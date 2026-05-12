package com.ra.base_spring_boot.model;

import com.ra.base_spring_boot.model.base.BaseCreatedObject;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "blog_posts")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BlogPost extends BaseCreatedObject
{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private BlogCategory category;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "slug", unique = true, length = 255)
    private String slug;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "status", length = 50)
    private String status;
}
