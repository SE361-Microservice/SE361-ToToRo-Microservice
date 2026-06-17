import { useState, useRef, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import ListingPickerModal from '../../../components/common/ListingPickerModal';
import type { ListingSummaryResponse } from '../../../types/listing';

interface Props {
  onSend: (content: string, type?: 'text' | 'image' | 'listing', listingData?: ListingSummaryResponse) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showListingPicker, setShowListingPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close attach menu when clicking outside
  useEffect(() => {
    if (!showAttachMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAttachMenu]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim(), 'text');
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    e.target.value = ''; // Reset input

    // Check if this is an image
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      // Upload the image to backend
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ url: string }>('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        const fullUrl = `${baseUrl}/api${response.data.url}`;
        // Send as image message with the full URL
        onSend(fullUrl, 'image');
      } catch (err) {
        console.error('Failed to upload image:', err);
        // Fallback: send as text
        onSend(`📎 [Đính kèm: ${file.name}]`, 'text');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Non-image files: send as text placeholder for now
      onSend(`📎 [Đính kèm: ${file.name}]`, 'text');
    }
  };

  const openFilePicker = (accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('accept', accept || '*');
      fileInputRef.current.click();
    }
  };

  const handleListingSelect = (listing: ListingSummaryResponse) => {
    setShowAttachMenu(false);
    // Send as a special listing message
    const content = JSON.stringify({
      type: 'listing_card',
      listingId: listing.id,
      title: listing.title,
      coverImage: listing.coverImageUrl,
      price: listing.priceRent,
    });
    onSend(content, 'text');
  };

  return (
    <footer className="p-4 bg-surface border-t border-outline-variant/10 flex-shrink-0">
      <div className="relative" ref={menuRef}>
        {/* Attachment menu popup */}
        {showAttachMenu && (
          <div className="absolute bottom-full left-0 mb-2 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-xl p-2 min-w-[200px] z-20">
            <button
              type="button"
              onClick={() => openFilePicker('image/*')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">image</span>
              </span>
              <span className="text-sm font-bold text-on-surface">Hình ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); setShowListingPicker(true); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container text-[18px]">holiday_village</span>
              </span>
              <span className="text-sm font-bold text-on-surface">Đính kèm phòng</span>
            </button>
            <button
              type="button"
              onClick={() => openFilePicker()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-left"
            >
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">description</span>
              </span>
              <span className="text-sm font-bold text-on-surface">Tài liệu</span>
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex items-center gap-2 bg-surface-container p-1.5 pl-4 rounded-full">
          <button
            type="button"
            className={`transition-colors flex-shrink-0 ${showAttachMenu ? 'text-primary' : 'text-outline hover:text-primary'}`}
            title="Đính kèm"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={isUploading}
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
          </button>

          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm py-2 min-w-0"
            style={{ boxShadow: 'none' }}
            placeholder={isUploading ? "Đang tải ảnh lên..." : "Nhập tin nhắn..."}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className="bg-primary text-on-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          )}
        </div>
      </div>

      {/* Listing Picker Modal for Chat */}
      <ListingPickerModal
        isOpen={showListingPicker}
        onClose={() => setShowListingPicker(false)}
        onSelect={handleListingSelect}
      />
    </footer>
  );
}
