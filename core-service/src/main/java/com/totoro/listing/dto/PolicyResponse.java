package com.totoro.listing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private Long id;
    private Short depositMonths;
    private String contractType;
    private Boolean allowsResidenceReg;
    private LocalTime checkinTime;
    private LocalTime checkoutTime;
    private Boolean allowsGuests;
    private Boolean allowsPets;
    private Boolean allowsCooking;
    private String referralPolicy;
    private String otherRules;
}
