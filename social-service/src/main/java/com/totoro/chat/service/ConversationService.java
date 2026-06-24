package com.totoro.chat.service;

import com.totoro.chat.dto.ConversationResponse;
import com.totoro.chat.dto.CreateConversationRequest;
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

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserCacheService userCacheService;

    @Transactional
    public ConversationResponse createConversation(Long creatorId, CreateConversationRequest request) {
        User creator = userCacheService.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + creatorId));

        Conversation conversation = conversationRepository.save(Conversation.builder()
                .type(request.getType())
                .name(request.getName())
                .createdBy(creator)
                .build());

        Set<Long> memberIds = new LinkedHashSet<>();
        memberIds.add(creator.getId());
        if (request.getMemberIds() != null) {
            memberIds.addAll(request.getMemberIds());
        }

        for (Long memberId : memberIds) {
            User member = userCacheService.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user thành viên: " + memberId));
            conversationMemberRepository.save(ConversationMember.builder()
                    .conversation(conversation)
                    .user(member)
                    .isAdmin(memberId.equals(creator.getId()))
                    .build());
        }

        if (request.getType() == ConversationType.DIRECT && memberIds.size() != 2) {
            throw new IllegalArgumentException("Cuộc trò chuyện DIRECT phải có đúng 2 thành viên");
        }

        return toResponse(conversation);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(Long userId) {
        return conversationMemberRepository.findByUserId(userId)
                .stream()
                .map(member -> toResponse(member.getConversation()))
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(Long userId, Long conversationId) {
        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new IllegalArgumentException("Bạn không thuộc cuộc trò chuyện này");
        }
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cuộc trò chuyện"));
        return toResponse(conversation);
    }

    private ConversationResponse toResponse(Conversation conversation) {
        List<MemberProfileDto> members = conversation.getMembers().stream()
            .map(conversationMember -> {
                User user = conversationMember.getUser();
                return MemberProfileDto.builder()
                        .id(user.getId())
                        .name(user.getFullName())
                        .avatar(user.getAvatarUrl())
                        .email(user.getEmail())
                        .build();
            })
            .toList();

        return ConversationResponse.builder()
            .id(conversation.getId())
            .type(conversation.getType())
            .name(conversation.getName())
            .createdById(conversation.getCreatedBy().getId())
            .members(members)
            .createdAt(conversation.getCreatedAt())
            .updatedAt(conversation.getUpdatedAt())
            .build();
    }
}
