package com.totoro.matching.controller;

import com.totoro.matching.dto.RoommateProfileResponse;
import com.totoro.matching.service.RoommateProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final RoommateProfileService roommateProfileService;

    @GetMapping("/feed")
    public ResponseEntity<List<RoommateProfileResponse>> getFeed(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(roommateProfileService.getFeed(userId, page, size));
    }
}


