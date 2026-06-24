package com.totoro.chat.service;

import com.totoro.chat.dto.AddMemberRequest;
import com.totoro.chat.dto.MemberProfileDto;
import com.totoro.chat.entity.Conversation;
import com.totoro.chat.entity.ConversationMember;
import com.totoro.chat.entity.ConversationType;
import com.totoro.chat.repository.ConversationMemberRepository;
import com.totoro.chat.repository.ConversationRepository;
import com.totoro.user.entity.User;
import com.totoro.user.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationMemberService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserCacheService userCacheService;

    @Transactional
    public void addMember(Long requesterId, Long conversationId, AddMemberRequest request) {
        User me = userCacheService.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + requesterId));

        ConversationMember myMembership = conversationMemberRepository.findByConversationIdAndUserId(conversationId, me.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bạn không thuộc cuộc trò chuyện này"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cuộc trò chuyện"));

        if (conversation.getType() == ConversationType.DIRECT) {
            throw new IllegalArgumentException("Không thể thêm thành viên vào cuộc trò chuyện DIRECT");
        }
        if (!myMembership.getIsAdmin()) {
            throw new IllegalArgumentException("Chỉ admin nhóm mới được thêm thành viên");
        }

        User member = userCacheService.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user thành viên"));

        if (conversationMemberRepository.existsByConversationIdAndUserId(conversationId, member.getId())) {
            return;
        }

        conversationMemberRepository.save(ConversationMember.builder()
                .conversation(conversation)
                .user(member)
                .isAdmin(request.getIsAdmin() != null && request.getIsAdmin())
                .build());
    }

    @Transactional
    public void removeMember(Long requesterId, Long conversationId, Long userId) {
        User me = userCacheService.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + requesterId));

        ConversationMember myMembership = conversationMemberRepository.findByConversationIdAndUserId(conversationId, me.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bạn không thuộc cuộc trò chuyện này"));
        if (!myMembership.getIsAdmin()) {
            throw new IllegalArgumentException("Chỉ admin nhóm mới được xóa thành viên");
        }

        conversationMemberRepository.deleteByConversationIdAndUserId(conversationId, userId);
    }

    public List<MemberProfileDto> listMembers(Long requesterId, Long conversationId) {
        userCacheService.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + requesterId));

        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, requesterId)) {
            throw new IllegalArgumentException("Bạn không thuộc cuộc trò chuyện này");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cuộc trò chuyện"));

        return conversation.getMembers().stream()
                .map(conversationMember -> {
                    User memberUser = conversationMember.getUser();
                    // Use user_cache fields directly (no separate UserProfile entity)
                    return MemberProfileDto.builder()
                            .id(memberUser.getId())
                            .name(memberUser.getFullName() != null ? memberUser.getFullName() : memberUser.getEmail())
                            .avatar(memberUser.getAvatarUrl())
                            .email(memberUser.getEmail())
                            .build();
                })
                .toList();
    }
}
