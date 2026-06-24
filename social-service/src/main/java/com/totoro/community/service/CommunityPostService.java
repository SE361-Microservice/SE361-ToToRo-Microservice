package com.totoro.community.service;

import com.totoro.community.dto.CommunityPostResponse;
import com.totoro.community.dto.CreateCommunityPostRequest;
import com.totoro.community.dto.UpdateCommunityPostRequest;
import com.totoro.community.entity.CommunityPost;
import com.totoro.community.entity.CommunityPostLike;
import com.totoro.community.repository.CommunityPostLikeRepository;
import com.totoro.community.repository.CommunityPostRepository;
import com.totoro.user.entity.User;
import com.totoro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommunityPostService {

    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommunityPostResponse createPost(Long userId, CreateCommunityPostRequest request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + userId));

        CommunityPost post = CommunityPost.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .listingId(request.getListingId())
                .build();
        return toResponse(communityPostRepository.save(post));
    }

    public List<CommunityPostResponse> getPosts() {
        return communityPostRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CommunityPostResponse getPostById(Long postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));
        return toResponse(post);
    }

    @Transactional
    public CommunityPostResponse updatePost(Long userId, Long postId, UpdateCommunityPostRequest request) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền sửa bài viết này");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setListingId(request.getListingId());
        return toResponse(communityPostRepository.save(post));
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa bài viết này");
        }
        communityPostRepository.delete(post);
    }

    @Transactional
    public Map<String, Object> toggleLike(Long userId, Long postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + userId));

        var existing = communityPostLikeRepository.findByPostIdAndUserId(postId, userId);
        boolean liked;
        if (existing.isPresent()) {
            communityPostLikeRepository.delete(existing.get());
            liked = false;
        } else {
            communityPostLikeRepository.save(CommunityPostLike.builder()
                    .post(post)
                    .user(user)
                    .build());
            liked = true;
        }

        long likeCount = communityPostLikeRepository.countByPostId(postId);
        return Map.of("liked", liked, "likeCount", likeCount);
    }

    private CommunityPostResponse toResponse(CommunityPost post) {
        long likeCount = communityPostLikeRepository.countByPostId(post.getId());
        return CommunityPostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getFullName())
                .authorEmail(post.getAuthor().getEmail())
                .authorAvatar(post.getAuthor().getAvatarUrl())
                .title(post.getTitle())
                .content(post.getContent())
                .listingId(post.getListingId())
                .likeCount(likeCount)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
