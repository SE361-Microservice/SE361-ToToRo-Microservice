package com.totoro.community.controller;

import com.totoro.community.dto.CommunityPostResponse;
import com.totoro.community.dto.CreateCommunityPostRequest;
import com.totoro.community.dto.UpdateCommunityPostRequest;
import com.totoro.community.service.CommunityPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;

    @PostMapping
    public ResponseEntity<CommunityPostResponse> createPost(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateCommunityPostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(communityPostService.createPost(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<CommunityPostResponse>> getPosts() {
        return ResponseEntity.ok(communityPostService.getPosts());
    }

    @GetMapping("/{postId}")
    public ResponseEntity<CommunityPostResponse> getPostById(@PathVariable Long postId) {
        return ResponseEntity.ok(communityPostService.getPostById(postId));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<CommunityPostResponse> updatePost(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody UpdateCommunityPostRequest request) {
        return ResponseEntity.ok(communityPostService.updatePost(userId, postId, request));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(@RequestHeader("X-User-Id") Long userId, @PathVariable Long postId) {
        communityPostService.deletePost(userId, postId);
        return ResponseEntity.ok("Xóa bài viết thành công");
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(@RequestHeader("X-User-Id") Long userId, @PathVariable Long postId) {
        return ResponseEntity.ok(communityPostService.toggleLike(userId, postId));
    }
}


