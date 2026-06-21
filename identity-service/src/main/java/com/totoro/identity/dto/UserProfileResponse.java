package com.totoro.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String role;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String bio;
    private String university;
    private Boolean isBlocked;
}
