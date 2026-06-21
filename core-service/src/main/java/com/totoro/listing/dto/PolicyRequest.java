package com.totoro.listing.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class PolicyRequest {
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
