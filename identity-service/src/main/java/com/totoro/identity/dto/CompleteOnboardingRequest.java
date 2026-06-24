package com.totoro.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompleteOnboardingRequest {

    /** "USER" (Học sinh) hoặc "LANDLORD" (Chủ trọ) — không cho phép ADMIN */
    @NotBlank
    @Pattern(regexp = "USER|LANDLORD", message = "Role phải là USER hoặc LANDLORD")
    private String role;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String university;

    @Size(max = 500)
    private String bio;
}
