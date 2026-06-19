package com.totoro.listing.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "room_type", nullable = false, length = 50)
    private String roomType;

    @Column(name = "area_m2", precision = 6, scale = 2)
    private BigDecimal areaM2;

    @Column(name = "price_rent", nullable = false)
    private Long priceRent;

    @Column(name = "price_electricity")
    private Long priceElectricity;

    @Column(name = "price_water")
    private Long priceWater;

    @Column(name = "price_management")
    private Long priceManagement;

    @Column(name = "price_parking")
    private Long priceParking;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ListingStatus status;

    @Builder.Default
    @Column(name = "is_shared_owner", nullable = false)
    private Boolean isSharedOwner = false;

    @Column(name = "max_occupants")
    private Short maxOccupants;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "landlord_id", nullable = false)
    private Long landlordId;

    @OneToOne(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ListingPolicy policy;

    @Builder.Default
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ListingFacility> facilities = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ListingImage> images = new HashSet<>();

    @Builder.Default
    @ManyToMany
    @JoinTable(name = "listing_tags", joinColumns = @JoinColumn(name = "listing_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void setPolicy(ListingPolicy policy) {
        this.policy = policy;
        if (policy != null) {
            policy.setListing(this);
        }
    }

    public void addFacility(ListingFacility facility) {
        this.facilities.add(facility);
        facility.setListing(this);
    }

    public void addImage(ListingImage image) {
        this.images.add(image);
        image.setListing(this);
    }
}
