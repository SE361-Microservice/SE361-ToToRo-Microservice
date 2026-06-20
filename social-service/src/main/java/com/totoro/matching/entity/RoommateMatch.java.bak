package com.totoro.matching.entity;

import com.totoro.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "roommate_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommateMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_a_id", nullable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_b_id", nullable = false)
    private User userB;

    @CreationTimestamp
    @Column(name = "matched_at", nullable = false, updatable = false)
    private LocalDateTime matchedAt;
}

