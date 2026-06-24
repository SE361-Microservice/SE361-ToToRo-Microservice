import { useState, useEffect, useRef } from 'react';
import communityService from '../../../services/communityService';
import apiClient from '../../../services/apiClient';
import type { CommunityPostResponse } from '../../../types/community';
import type { ListingSummaryResponse } from '../../../types/listing';
import useAuthStore from '../../../store/authStore';
import PostCard from '../components/PostCard';
import StudentLayout from '../../../layouts/StudentLayout';
import { useConfirm } from '../../../hooks/useConfirm';
import ListingPickerModal from '../../../components/common/ListingPickerModal';
import ListingAttachmentCard from '../../../components/common/ListingAttachmentCard';

export default function CommunityPage() {
  const confirm = useConfirm();
  const [posts, setPosts] = useState<CommunityPostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  const navUser = isAuthenticated && user ? {
    name: user.fullName || user.email,
    avatar: user.avatarUrl || '',
    role: user.role
  } : undefined;

  // Create post state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);

  // Image attachment state
  const [postImageFiles, setPostImageFiles] = useState<File[]>([]);
  const [postImagePreviews, setPostImagePreviews] = useState<string[]>([]);
  const postFileRef = useRef<HTMLInputElement>(null);

  // Listing attachment state
  const [attachedListing, setAttachedListing] = useState<ListingSummaryResponse | null>(null);
  const [showListingPicker, setShowListingPicker] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await communityService.getPosts();
      // Sort newest first
      setPosts(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPostImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPostImageFiles(prev => [...prev, ...files]);
    setPostImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const handleRemovePostImage = (index: number) => {
    setPostImageFiles(prev => prev.filter((_, i) => i !== index));
    setPostImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Upload all images first
      const imageUrls: string[] = [];
      for (const file of postImageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await apiClient.post<{ url: string }>('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        if (baseUrl.endsWith('/api')) {
          baseUrl = baseUrl.slice(0, -4);
        }
        imageUrls.push(`${baseUrl}/api${uploadRes.data.url}`);
      }

      const newPost = await communityService.createPost({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        listingId: attachedListing?.id,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      setPosts(prev => [newPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
      setPostImageFiles([]);
      setPostImagePreviews([]);
      setAttachedListing(null);
      setIsCreateExpanded(false);
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    const ok = await confirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      confirmLabel: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await communityService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  return (
    <StudentLayout user={navUser}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-[32px] text-primary">forum</span>
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">Cộng đồng ToToRo</h1>
            <p className="text-on-surface-variant text-sm">Nơi kết nối, chia sẻ kinh nghiệm tìm trọ và tìm bạn ở ghép</p>
          </div>
        </div>

        {/* Create Post Box */}
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 mb-8 shadow-sm transition-all duration-300">
          {!isCreateExpanded ? (
            <div className="flex gap-3 items-center">
              {navUser?.avatar ? (
                <img src={navUser.avatar} alt={navUser.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold uppercase flex-shrink-0">
                  {navUser?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              <button 
                onClick={() => setIsCreateExpanded(true)}
                className="flex-1 bg-surface-container hover:bg-surface-container-high transition-colors text-left px-4 py-3 rounded-full text-on-surface-variant/70 text-sm"
              >
                Bạn muốn chia sẻ điều gì hôm nay?
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreatePost} className="animate-in fade-in zoom-in-95 duration-200 origin-top">
              <div className="flex gap-3 mb-4">
                {navUser?.avatar ? (
                  <img src={navUser.avatar} alt={navUser.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold uppercase flex-shrink-0">
                    {navUser?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-on-surface">{user?.email?.split('@')[0] || 'Người dùng'}</p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Tiêu đề bài viết..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-on-surface placeholder:text-on-surface-variant/50 border-none outline-none mb-3"
                autoFocus
              />
              <textarea
                placeholder="Nội dung chi tiết..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/50 border-none outline-none resize-none mb-2"
              />

              {/* Image Previews */}
              {postImagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {postImagePreviews.map((preview, i) => (
                    <div key={i} className="relative">
                      <img src={preview} alt={`Preview ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePostImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-on-primary rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attached Listing Preview */}
              {attachedListing && (
                <div className="mb-3 relative">
                  <ListingAttachmentCard
                    listingId={attachedListing.id}
                    title={attachedListing.title}
                    address={attachedListing.address}
                    coverImage={attachedListing.coverImageUrl}
                    price={attachedListing.priceRent}
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedListing(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-primary rounded-full flex items-center justify-center text-xs hover:scale-110 transition-transform shadow"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={postFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddPostImages}
              />

              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowListingPicker(true)} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors tooltip-wrapper" title="Đính kèm phòng">
                    <span className="material-symbols-outlined text-[20px]">holiday_village</span>
                  </button>
                  <button type="button" onClick={() => postFileRef.current?.click()} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors tooltip-wrapper" title="Thêm ảnh">
                    <span className="material-symbols-outlined text-[20px]">image</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setIsCreateExpanded(false); setPostImageFiles([]); setPostImagePreviews([]); setAttachedListing(null); }}
                    className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors text-sm"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={!newPostTitle.trim() || !newPostContent.trim() || isSubmitting}
                    className="px-6 py-2 font-bold text-on-primary bg-primary hover:opacity-90 disabled:opacity-50 rounded-xl transition-colors text-sm flex items-center gap-2"
                  >
                    {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                    {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Posts Feed */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
              <p className="font-bold text-on-surface-variant">Đang tải bảng tin...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/20 rounded-3xl">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">forum</span>
              <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Chưa có bài viết nào</h3>
              <p className="text-on-surface-variant">Hãy là người đầu tiên tạo chủ đề thảo luận!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUser={navUser ? { email: user!.email, name: navUser.name, avatar: navUser.avatar } : undefined} 
                  onDelete={handleDeletePost} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Listing Picker Modal */}
      <ListingPickerModal
        isOpen={showListingPicker}
        onClose={() => setShowListingPicker(false)}
        onSelect={(listing) => setAttachedListing(listing)}
      />
    </StudentLayout>
  );
}
