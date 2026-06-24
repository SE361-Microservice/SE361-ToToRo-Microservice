package com.totoro.community.service;

import com.totoro.community.dto.CommunityCommentResponse;
import com.totoro.community.dto.CreateCommunityCommentRequest;
import com.totoro.community.dto.UpdateCommunityCommentRequest;
import com.totoro.community.entity.CommunityComment;
import com.totoro.community.entity.CommunityPost;
import com.totoro.community.repository.CommunityCommentRepository;
import com.totoro.community.repository.CommunityPostRepository;
import com.totoro.user.entity.User;
import com.totoro.user.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityCommentService {

    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityPostRepository communityPostRepository;
    private final UserCacheService userCacheService;

    @Transactional
    public CommunityCommentResponse createComment(Long userId, Long postId, CreateCommunityCommentRequest request) {
        User author = userCacheService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + userId));
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        CommunityComment parent = null;
        if (request.getParentId() != null) {
            parent = communityCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy comment cha"));
            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Comment cha không thuộc bài viết này");
            }
        }

        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .author(author)
                .parent(parent)
                .content(request.getContent())
                .build();

        return toResponse(communityCommentRepository.save(comment));
    }

    public List<CommunityCommentResponse> getCommentsByPost(Long postId) {
        return communityCommentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommunityCommentResponse updateComment(Long userId, Long commentId, UpdateCommunityCommentRequest request) {
        CommunityComment comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy comment"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền sửa comment này");
        }

        comment.setContent(request.getContent());
        return toResponse(communityCommentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        CommunityComment comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy comment"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa comment này");
        }

        comment.setIsDeleted(true);
        comment.setContent("Bình luận đã bị xóa");
        communityCommentRepository.save(comment);
    }

    private CommunityCommentResponse toResponse(CommunityComment comment) {
        return CommunityCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .authorId(comment.getAuthor().getId())
                .authorEmail(comment.getAuthor().getEmail())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .content(comment.getContent())
                .isDeleted(comment.getIsDeleted())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
