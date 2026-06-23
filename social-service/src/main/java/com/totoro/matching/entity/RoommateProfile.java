package com.totoro.matching.entity;

import com.totoro.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "roommate_profiles", uniqueConstraints = @UniqueConstraint(name = "uk_roommate_profile_user", columnNames = "user_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommateProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "preferred_city", length = 100)
    private String preferredCity;

    @Column(name = "budget_min")
    private Long budgetMin;

    @Column(name = "budget_max")
    private Long budgetMax;

    private Integer age;

    @Column(length = 10)
    private String gender;

    @Column(name = "preferred_districts", length = 500)
    private String preferredDistricts;

    @Column(name = "sleep_time", length = 20)
    private String sleepTime;

    @Column(name = "wake_time", length = 20)
    private String wakeTime;

    private Integer cleanliness;

    @Column(name = "is_smoker")
    private Boolean isSmoker;

    @Column(name = "drinks_alcohol")
    private Boolean drinksAlcohol;

    @Column(name = "has_pets")
    private Boolean hasPets;

    @Column(name = "is_introvert")
    private Boolean isIntrovert;

    @Column(name = "ok_with_smoker")
    private Boolean okWithSmoker;

    @Column(name = "ok_with_pets")
    private Boolean okWithPets;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

