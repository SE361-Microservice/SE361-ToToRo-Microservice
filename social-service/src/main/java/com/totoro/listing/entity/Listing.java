package com.totoro.listing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "listing_cache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {
    @Id
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 500)
    private String address;
}


