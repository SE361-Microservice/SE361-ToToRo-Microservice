package com.totoro.chat.service;

import com.totoro.chat.dto.MessageRequest;
import com.totoro.chat.dto.MessageResponse;
import com.totoro.chat.entity.Conversation;
import com.totoro.chat.entity.Message;
import com.totoro.chat.repository.ConversationMemberRepository;
import com.totoro.chat.repository.ConversationRepository;
import com.totoro.chat.repository.MessageRepository;
import com.totoro.user.entity.User;
import com.totoro.user.repository.UserRepository;
import com.totoro.user.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final UserRepository userRepository;
    private final UserCacheService userCacheService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendMessage(Long senderId, Long conversationId, MessageRequest request) {
        User sender = userCacheService.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + senderId));
        ensureMember(conversationId, sender.getId());
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cuộc trò chuyện"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .build();
        MessageResponse response = toResponse(messageRepository.save(message));
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, response);
        return response;
    }

    /**
     * WebSocket handler calls this with the principal name (email).
     * Looks up user by email to get userId then dispatches.
     */
    @Transactional
    public MessageResponse sendMessageByEmail(String email, Long conversationId, MessageRequest request) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + email));
        return sendMessage(sender.getId(), conversationId, request);
    }

    public List<MessageResponse> getMessages(Long userId, Long conversationId) {
        ensureMember(conversationId, userId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MessageResponse updateMessage(Long userId, Long messageId, MessageRequest request) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin nhắn"));
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền sửa tin nhắn này");
        }
        message.setContent(request.getContent());
        MessageResponse response = toResponse(messageRepository.save(message));
        messagingTemplate.convertAndSend("/topic/conversations/" + message.getConversation().getId(), response);
        return response;
    }

    @Transactional
    public void deleteMessage(Long userId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin nhắn"));
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa tin nhắn này");
        }
        message.setIsDeleted(true);
        message.setContent("Tin nhắn đã bị xóa");
        MessageResponse response = toResponse(messageRepository.save(message));
        messagingTemplate.convertAndSend("/topic/conversations/" + message.getConversation().getId(), response);
    }

    private void ensureMember(Long conversationId, Long userId) {
        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new IllegalArgumentException("Bạn không thuộc cuộc trò chuyện này");
        }
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderEmail(message.getSender().getEmail())
                .content(message.getContent())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
}
