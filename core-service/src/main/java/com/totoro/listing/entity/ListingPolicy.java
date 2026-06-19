package com.totoro.listing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "listing_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", unique = true)
    private Listing listing;

    @Column(name = "deposit_months")
    private Short depositMonths;

    @Column(name = "contract_type", length = 50)
    private String contractType;

    @Builder.Default
    @Column(name = "allows_residence_reg", nullable = false)
    private Boolean allowsResidenceReg = false;

    @Column(name = "checkin_time")
    private LocalTime checkinTime;

    @Column(name = "checkout_time")
    private LocalTime checkoutTime;

    @Builder.Default
    @Column(name = "allows_guests", nullable = false)
    private Boolean allowsGuests = true;

    @Builder.Default
    @Column(name = "allows_pets", nullable = false)
    private Boolean allowsPets = false;

    @Builder.Default
    @Column(name = "allows_cooking", nullable = false)
    private Boolean allowsCooking = true;

    @Column(name = "referral_policy", columnDefinition = "TEXT")
    private String referralPolicy;

    @Column(name = "other_rules", columnDefinition = "TEXT")
    private String otherRules;
}
