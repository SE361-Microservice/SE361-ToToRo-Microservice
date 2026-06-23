package com.totoro.chat.controller;

import com.totoro.chat.dto.AddMemberRequest;
import com.totoro.chat.dto.MemberProfileDto;
import com.totoro.chat.service.ConversationMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations/{conversationId}/members")
@RequiredArgsConstructor
public class ConversationMemberController {

    private final ConversationMemberService conversationMemberService;

    @PostMapping
    public ResponseEntity<String> addMember(
            @RequestHeader("X-User-Id") Long requesterId,
            @PathVariable Long conversationId,
            @Valid @RequestBody AddMemberRequest request) {
        conversationMemberService.addMember(requesterId, conversationId, request);
        return ResponseEntity.ok("Thêm thành viên thành công");
    }

    @GetMapping
    public ResponseEntity<List<MemberProfileDto>> listMembers(
            @RequestHeader("X-User-Id") Long requesterId,
            @PathVariable Long conversationId) {
        return ResponseEntity.ok(conversationMemberService.listMembers(requesterId, conversationId));
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<String> removeMember(
            @RequestHeader("X-User-Id") Long requesterId,
            @PathVariable Long conversationId,
            @PathVariable Long targetUserId) {
        conversationMemberService.removeMember(requesterId, conversationId, targetUserId);
        return ResponseEntity.ok("Xóa thành viên thành công");
    }
}
