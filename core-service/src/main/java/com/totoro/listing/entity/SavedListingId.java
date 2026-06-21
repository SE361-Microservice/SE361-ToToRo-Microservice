package com.totoro.listing.entity;

import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedListingId implements Serializable {

    private Long userId;
    private Long listing;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SavedListingId that = (SavedListingId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(listing, that.listing);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, listing);
    }
}
