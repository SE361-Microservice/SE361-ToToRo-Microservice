import { useState, useEffect, useRef } from 'react';
import type { CommunityPostResponse, CommunityCommentResponse } from '../../../types/community';
import communityService from '../../../services/communityService';
import apiClient from '../../../services/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../hooks/useConfirm';
import ImageSlideshow from '../../../components/common/ImageSlideshow';
import ListingAttachmentCard from '../../../components/common/ListingAttachmentCard';
import ListingPickerModal from '../../../components/common/ListingPickerModal';
import type { ListingSummaryResponse } from '../../../types/listing';

/** Try to parse a listing_card JSON message */
function tryParseListingCard(content: string | null) {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === 'listing_card' && parsed.listingId) return parsed;
  } catch { /* not JSON */ }
  return null;
}

interface PostCardProps {
  post: CommunityPostResponse;
  currentUser: {
    email: string;
    name?: string;
    avatar?: string;
  } | undefined;
  onDelete?: (postId: number) => void;
}

export default function PostCard({ post, currentUser, onDelete }: PostCardProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const [comments, setComments] = useState<CommunityCommentResponse[]>([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [isLiked, setIsLiked] = useState(post.likedByMe ?? false);
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState<string | null>(null);
  const [showCommentListingPicker, setShowCommentListingPicker] = useState(false);
  const [commentAttachedListing, setCommentAttachedListing] = useState<ListingSummaryResponse | null>(null);
  const commentFileRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const loadComments = async () => {
    try {
      const data = await communityService.getComments(post.id);
      // Sort newest first
      setComments(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const handleCommentButtonClick = () => {
    commentInputRef.current?.focus();
  };

  const handleToggleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      const res = await communityService.toggleLike(post.id);
      setIsLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      // Revert on failure
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      console.error('Failed to toggle like', err);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community?post=${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.info('Đã sao chép liên kết bài viết!');
    } catch {
      toast.warning('Không thể sao chép liên kết. Vui lòng thử lại.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newComment.trim() && !commentImageFile && !commentAttachedListing) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      // Upload image if selected
      if (commentImageFile) {
        const formData = new FormData();
        formData.append('file', commentImageFile);
        const uploadRes = await apiClient.post<{ url: string }>('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        imageUrl = `${baseUrl}/api${uploadRes.data.url}`;
      }

      let content = newComment.trim();
      if (commentAttachedListing) {
        content = JSON.stringify({
          type: 'listing_card',
          text: newComment.trim(),
          listingId: commentAttachedListing.id,
          title: commentAttachedListing.title,
          coverImage: commentAttachedListing.coverImageUrl,
          price: commentAttachedListing.priceRent,
        });
      } else if (!content && commentImageFile) {
        content = '📷';
      }

      const added = await communityService.createComment(post.id, {
        content,
        imageUrl,
      });
      setComments(prev => [added, ...prev]);
      setNewComment('');
      setCommentImageFile(null);
      setCommentImagePreview(null);
      setCommentAttachedListing(null);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const ok = await confirm({
      title: 'Xóa bình luận',
      message: 'Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác.',
      confirmLabel: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await communityService.deleteComment(post.id, commentId);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isDeleted: true, content: 'Bình luận đã bị xóa' } : c));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi });

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 mb-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {post.authorAvatar ? (
            <img 
              src={post.authorAvatar} 
              alt={post.authorName || post.authorEmail} 
              className="w-10 h-10 rounded-full object-cover" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
              {(post.authorName || post.authorEmail).charAt(0)}
            </div>
          )}
          <div>
            <h4 className="font-bold text-on-surface leading-tight">{post.authorName || post.authorEmail.split('@')[0]}</h4>
            <span className="text-xs text-on-surface-variant">{timeAgo}</span>
          </div>
        </div>
        {currentUser?.email === post.authorEmail && onDelete && (
          <button 
            onClick={() => onDelete(post.id)}
            className="text-on-surface-variant hover:text-error transition-colors p-1"
            title="Xóa bài viết"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="mb-4">
        <h3 className="font-headline font-bold text-lg mb-2 text-on-surface">{post.title}</h3>
        <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {/* Image slideshow */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mt-3">
            <ImageSlideshow images={post.imageUrls} aspectRatio="16/9" />
          </div>
        )}

        {/* Listing attachment card */}
        {post.listingId && (
          <div className="mt-3">
            <ListingAttachmentCard
              listingId={post.listingId}
              title={post.listingTitle}
              address={post.listingAddress}
              coverImage={post.listingCoverImage}
              price={post.listingPrice}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-outline-variant/10">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 transition-colors font-bold text-sm ${
            isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>
            thumb_up
          </span>
          {likeCount > 0 ? `${likeCount} Thích` : 'Thích'}
        </button>
        <button 
          onClick={handleCommentButtonClick}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
          Bình luận
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm ml-auto"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
          Chia sẻ
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 pt-4 border-t border-outline-variant/10 animate-in fade-in duration-200">
        {/* Comment List */}
        <div className="space-y-4 mb-4">
          {comments.length === 0 ? (
            <p className="text-sm text-center text-on-surface-variant py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          ) : (
            <>
              {(showAllComments ? comments : comments.slice(0, 2)).map(comment => (
                <div key={comment.id} className="flex gap-3">
                  {comment.authorAvatar ? (
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.authorName || comment.authorEmail} 
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center text-xs font-bold uppercase text-on-surface-variant">
                      {(comment.authorName || comment.authorEmail).charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 bg-surface-container rounded-2xl rounded-tl-none p-3 relative group">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-sm text-on-surface">{comment.authorName || comment.authorEmail.split('@')[0]}</span>
                      <span className="text-[10px] text-on-surface-variant">
                        {formatDistanceToNow(new Date(comment.createdAt), { locale: vi })}
                      </span>
                    </div>
                    {(() => {
                      const listingCard = tryParseListingCard(comment.content);
                      if (listingCard) {
                        return (
                          <div className="space-y-2 mb-2">
                            {listingCard.text && (
                              <p className={`text-sm ${comment.isDeleted ? 'text-on-surface-variant italic' : 'text-on-surface'} whitespace-pre-wrap`}>
                                {listingCard.text}
                              </p>
                            )}
                            <div className="max-w-[280px]">
                              <ListingAttachmentCard
                                listingId={listingCard.listingId}
                                title={listingCard.title}
                                address={listingCard.address}
                                coverImage={listingCard.coverImage}
                                price={listingCard.price}
                                compact
                              />
                            </div>
                          </div>
                        );
                      }
                      return (
                        <p className={`text-sm ${comment.isDeleted ? 'text-on-surface-variant italic' : 'text-on-surface'}`}>
                          {comment.content}
                        </p>
                      );
                    })()}
                    {comment.imageUrl && !comment.isDeleted && (
                      <img
                        src={comment.imageUrl}
                        alt="Ảnh đính kèm"
                        className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(comment.imageUrl!, '_blank')}
                      />
                    )}
                    {currentUser?.email === comment.authorEmail && !comment.isDeleted && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-error hover:bg-error/10 p-1 rounded transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
              }
              {!showAllComments && comments.length > 2 && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Xem thêm {comments.length - 2} bình luận...
                </button>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="space-y-2 mt-2">
            {/* Image preview */}
            {commentImagePreview && (
              <div className="relative inline-block">
                <img src={commentImagePreview} alt="Preview" className="h-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => { setCommentImageFile(null); setCommentImagePreview(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-on-primary rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Attached Listing preview */}
            {commentAttachedListing && (
              <div className="relative inline-block mb-2 ml-[48px]">
                <div className="w-[280px]">
                  <ListingAttachmentCard
                    listingId={commentAttachedListing.id}
                    title={commentAttachedListing.title}
                    address={commentAttachedListing.address}
                    coverImage={commentAttachedListing.coverImageUrl}
                    price={commentAttachedListing.priceRent}
                    compact
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCommentAttachedListing(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-primary rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform shadow z-10"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-2 items-start">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name || currentUser.email}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-on-primary font-bold uppercase">
                  {currentUser?.name?.charAt(0) || currentUser?.email.charAt(0) || 'U'}
                </div>
              )}
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                rows={1}
                className="flex-1 bg-surface-container-low rounded-xl px-3 py-2 text-sm text-on-surface border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit(e);
                  }
                }}
              />

              {/* Image attach button */}
              <input
                ref={commentFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCommentImageFile(file);
                    setCommentImagePreview(URL.createObjectURL(file));
                  }
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => setShowCommentListingPicker(true)}
                className="h-10 w-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors flex-shrink-0"
                title="Đính kèm phòng"
              >
                <span className="material-symbols-outlined text-[18px]">holiday_village</span>
              </button>
              <button
                type="button"
                onClick={() => commentFileRef.current?.click()}
                className="h-10 w-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors flex-shrink-0"
                title="Đính kèm ảnh"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
              </button>

              <button
                type="submit"
                disabled={(!newComment.trim() && !commentImageFile && !commentAttachedListing) || isSubmitting}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">send</span>
                )}
              </button>
            </div>
          </form>
        </div>

      {/* Listing Picker Modal for Comments */}
      <ListingPickerModal
        isOpen={showCommentListingPicker}
        onClose={() => setShowCommentListingPicker(false)}
        onSelect={(listing) => setCommentAttachedListing(listing)}
      />
    </div>
  );
}
