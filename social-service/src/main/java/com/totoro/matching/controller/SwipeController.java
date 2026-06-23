package com.totoro.matching.controller;

import com.totoro.matching.dto.RoommateMatchResponse;
import com.totoro.matching.dto.SwipeRequest;
import com.totoro.matching.dto.SwipeResponse;
import com.totoro.matching.service.SwipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class SwipeController {

    private final SwipeService swipeService;

    @PostMapping("/swipe")
    public ResponseEntity<SwipeResponse> swipe(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody SwipeRequest request) {
        return ResponseEntity.ok(swipeService.swipe(userId, request));
    }

    @GetMapping("/matches")
    public ResponseEntity<List<RoommateMatchResponse>> getMyMatches(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(swipeService.getMyMatches(userId));
    }
}


