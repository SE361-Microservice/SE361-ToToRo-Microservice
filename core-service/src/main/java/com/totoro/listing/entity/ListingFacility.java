package com.totoro.listing.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "listing_facilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "facility_type", nullable = false, length = 50)
    private String facilityType;

    @Column(nullable = false, length = 100)
    private String name;

    @Builder.Default
    @Column(name = "is_included", nullable = false)
    private Boolean isIncluded = true;

    @Column(length = 255)
    private String note;
}
