package com.totoro.listing.controller;

import com.totoro.listing.dto.TagDto;
import com.totoro.listing.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    /**
     * Get all tags. Public endpoint.
     */
    @GetMapping
    public ResponseEntity<List<TagDto>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    /**
     * Create a new tag. ADMIN only.
     */
        @PostMapping
    public ResponseEntity<TagDto> createTag(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tag name is required");
        }
        TagDto tag = tagService.createTag(name.trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }

    /**
     * Update a tag. ADMIN only.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TagDto> updateTag(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tag name is required");
        }
        TagDto tag = tagService.updateTag(id, name.trim());
        return ResponseEntity.ok(tag);
    }

    /**
     * Delete a tag. ADMIN only.
     */
        @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok("Tag deleted successfully");
    }
}
