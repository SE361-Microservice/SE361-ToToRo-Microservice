package com.totoro.review.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "review_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(name = "src_url", nullable = false, length = 500)
    private String srcUrl;

    @Column(name = "sort_order")
    private Short sortOrder;
}
