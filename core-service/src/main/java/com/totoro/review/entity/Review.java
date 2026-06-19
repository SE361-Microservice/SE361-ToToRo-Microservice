package com.totoro.review.entity;

import com.totoro.listing.entity.Listing;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "rating_overall", nullable = false)
    private Short ratingOverall;

    @Column(name = "rating_cleanliness")
    private Short ratingCleanliness;

    @Column(name = "rating_security")
    private Short ratingSecurity;

    @Column(name = "rating_landlord")
    private Short ratingLandlord;

    @Column(name = "rating_accuracy")
    private Short ratingAccuracy;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(name = "upvote_count")
    private Integer upvoteCount = 0;

    @Column(name = "landlord_reply_content", columnDefinition = "TEXT")
    private String landlordReplyContent;

    @Column(name = "landlord_replied_at")
    private LocalDateTime landlordRepliedAt;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReviewSource> sources = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
