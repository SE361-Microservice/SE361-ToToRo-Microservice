import { useState, useEffect, useCallback } from 'react';
import Modal from '../core/Modal';
import listingService from '../../services/listingService';
import savedListingService from '../../services/savedListingService';
import type { ListingSummaryResponse } from '../../types/listing';
import useAuthStore from '../../store/authStore';

interface ListingPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (listing: ListingSummaryResponse) => void;
}

type FilterMode = 'search' | 'my_listings' | 'saved';

/**
 * Modal to search and pick a listing to attach.
 * - Landlord: shows "Phòng của tôi" filter
 * - Student: shows "Phòng đã lưu" filter
 * - All users: can search all active listings
 */
export default function ListingPickerModal({ isOpen, onClose, onSelect }: ListingPickerModalProps) {
  const { user } = useAuthStore();
  const isLandlord = user?.role === 'LANDLORD';

  const [filterMode, setFilterMode] = useState<FilterMode>('search');
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<ListingSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setSearched(true);
    try {
      if (filterMode === 'my_listings') {
        const res = await listingService.getMyListings({ size: 50 });
        setListings(res.content);
      } else if (filterMode === 'saved') {
        const res = await savedListingService.getSavedListings({ size: 50 });
        setListings(res.content);
      } else {
        // Search mode
        const res = await listingService.search({
          size: 20,
        });
        setListings(res.content);
      }
    } catch (err) {
      console.error('Failed to load listings', err);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterMode, query]);

  // Load on open and filter change
  useEffect(() => {
    if (isOpen) {
      loadListings();
    }
  }, [isOpen, filterMode]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setListings([]);
      setSearched(false);
      setFilterMode('search');
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const formatPrice = (p: number) => {
    if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}tr`;
    if (p >= 1_000) return `${(p / 1_000).toFixed(0)}k`;
    return `${p}đ`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đính kèm phòng trọ">
      <div className="p-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMode('search')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filterMode === 'search'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">search</span>
            Tìm kiếm
          </button>
          {isLandlord && (
            <button
              onClick={() => setFilterMode('my_listings')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filterMode === 'my_listings'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">home_work</span>
              Phòng của tôi
            </button>
          )}
          {!isLandlord && (
            <button
              onClick={() => setFilterMode('saved')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                filterMode === 'saved'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">bookmark</span>
              Phòng đã lưu
            </button>
          )}
        </div>

        {/* Search bar (only in search mode) */}
        {filterMode === 'search' && (
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo quận/huyện..."
              className="flex-1 bg-surface-container rounded-xl px-3 py-2.5 text-sm text-on-surface border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-colors flex-shrink-0"
            >
              Tìm
            </button>
          </form>
        )}

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {isLoading && (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant">Đang tải...</p>
            </div>
          )}

          {!isLoading && searched && listings.length === 0 && (
            <div className="py-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl mb-2">search_off</span>
              <p className="text-sm">Không tìm thấy phòng nào</p>
            </div>
          )}

          {!isLoading && listings.map((listing) => (
            <button
              key={listing.id}
              onClick={() => { onSelect(listing); onClose(); }}
              className="flex items-center gap-3 w-full p-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl hover:shadow-md hover:border-primary/30 transition-all text-left group"
            >
              {listing.coverImageUrl ? (
                <img src={listing.coverImageUrl} alt={listing.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container">holiday_village</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{listing.title}</p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                </p>
                <p className="text-sm font-bold text-primary mt-1">
                  {formatPrice(listing.priceRent)}<span className="text-xs font-normal text-on-surface-variant">/tháng</span>
                </p>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary text-[18px] flex-shrink-0 transition-colors">add_circle</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
