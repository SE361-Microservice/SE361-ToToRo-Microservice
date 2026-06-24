import { useState, useMemo, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import TopNavBar from '../../../components/common/TopNavBar';
import ListingCard from '../../../components/common/ListingCard';
import MapView from '../../../components/common/MapView';
import Tooltip from '../../../components/ui/Tooltip';
import listingService from '../../../services/listingService';
import type { ListingSummaryResponse, Listing } from '../../../types/listing';
import SearchFilterPanel, {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  type SearchFilters,
  type SortOption,
} from '../components/SearchFilterPanel';
import useAuthStore from '../../../store/authStore';
import useSavedListings from '../../../hooks/useSavedListings';

/**
 * Convert backend ListingSummaryResponse to the legacy Listing shape
 * expected by ListingCard and MapView.
 */
function toListingCompat(summary: ListingSummaryResponse): Listing {
  return {
    id: String(summary.id),
    landlordId: '',
    title: summary.title,
    description: '',
    address: summary.address,
    city: summary.city,
    latitude: summary.latitude,
    longitude: summary.longitude,
    roomType: summary.roomType as Listing['roomType'],
    areaM2: summary.areaM2,
    priceRent: summary.priceRent,
    status: 'ACTIVE',
    isSharedOwner: false,
    maxOccupants: 0,
    createdAt: summary.createdAt,
    updatedAt: summary.createdAt,
    images: summary.coverImageUrl
      ? [{ id: '0', listingId: String(summary.id), url: summary.coverImageUrl, isCover: true, sortOrder: 0, createdAt: summary.createdAt }]
      : [],
    tags: summary.tags?.map(t => ({ id: String(t.id), name: t.name, slug: t.slug })) ?? [],
  };
}

/** Map frontend sort option → backend sortBy/sortDir */
function mapSortToApi(sort: SortOption): { sortBy: string; sortDir: string } {
  switch (sort) {
    case 'price_asc': return { sortBy: 'priceRent', sortDir: 'asc' };
    case 'price_desc': return { sortBy: 'priceRent', sortDir: 'desc' };
    case 'area_desc': return { sortBy: 'areaM2', sortDir: 'desc' };
    case 'rating_desc': return { sortBy: 'createdAt', sortDir: 'desc' }; // BE doesn't have rating sort, fallback
    default: return { sortBy: 'createdAt', sortDir: 'desc' };
  }
}

export default function ListingSearchPage() {
  const { t } = useTranslation();
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'row'>('card');
  const [hiddenListingIds, setHiddenListingIds] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { savedListingIds, toggleSave: onToggleSave } = useSavedListings();

  // Filter & sort state
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSatellite, setIsSatellite] = useState(false);

  // API data state
  const [apiListings, setApiListings] = useState<ListingSummaryResponse[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  // ── Fetch listings from API ────────────────────────────────────
  const fetchListings = useCallback(async (page = currentPage) => {
    setIsLoading(true);
    setApiError(null);

    const sort = mapSortToApi(sortBy);

    try {
      const result = await listingService.search({
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < 20000000 ? filters.priceRange[1] : undefined,
        roomTypes: filters.roomTypes.length > 0 ? filters.roomTypes : undefined,
        minArea: filters.areaRange[0] > 0 ? filters.areaRange[0] : undefined,
        maxArea: filters.areaRange[1] < 100 ? filters.areaRange[1] : undefined,
        district: filters.districts.length === 1 ? filters.districts[0] : undefined,
        tagSlugs: filters.amenities.length > 0 ? filters.amenities : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
        page,
        size: PAGE_SIZE,
      });

      setApiListings(result.content);
      setTotalResults(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(page);
    } catch (err: unknown) {
      console.error('Failed to fetch listings:', err);
      setApiError('Không thể tải danh sách phòng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, currentPage]);

  // Debounced fetch on filter/sort change
  // Reset to page 0 when filters/sort change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings(0);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy]);

  const toggleHide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHiddenListingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Convert API data to legacy Listing shape & apply client-side text search
  const filteredListings = useMemo(() => {
    let result = apiListings.map(toListingCompat);

    // Client-side text search (backend doesn't have keyword search)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
      );
    }

    return result;
  }, [apiListings, searchQuery]);

  const visibleListings = filteredListings.filter(l => !hiddenListingIds.has(l.id));
  const allHidden = hiddenListingIds.size === filteredListings.length && filteredListings.length > 0;

  const toggleAll = () => {
    if (allHidden) {
      setHiddenListingIds(new Set());
    } else {
      setHiddenListingIds(new Set(filteredListings.map(l => l.id)));
    }
  };

  // Count active filters
  const activeFilterCount = [
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] || filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1],
    filters.areaRange[0] !== DEFAULT_FILTERS.areaRange[0] || filters.areaRange[1] !== DEFAULT_FILTERS.areaRange[1],
    filters.roomTypes.length > 0,
    filters.districts.length > 0,
    filters.amenities.length > 0,
    filters.minRating > 0,
  ].filter(Boolean).length;

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Mới nhất';

  const { user: authUser, isAuthenticated } = useAuthStore();

  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    avatar: authUser.avatarUrl || '',
    role: authUser.role
  } : undefined;

  const navVariant = isAuthenticated
    ? (authUser?.role === 'ADMIN' || authUser?.role === 'LANDLORD' ? 'dashboard' : 'student')
    : 'guest';

  return (
    <div className="bg-background text-on-surface font-body antialiased h-screen flex flex-col overflow-hidden">
      {/* TopNavBar */}
      <div className="fixed top-0 left-0 w-full z-[100]">
        <TopNavBar
          variant={navVariant}
          navLinks={[
            { label: 'Trang chủ', href: '/home' },
            { label: 'Tìm phòng', href: '/search', active: true },
            { label: 'Matchmates', href: '/matching' },
            { label: 'Cộng đồng', href: '/community' },
            { label: 'Tin nhắn', href: '/messages' },
          ]}
          user={navUser}
          extraActions={isAuthenticated && authUser?.role === 'STUDENT' ? [
            {
              icon: 'bookmark',
              label: 'Nhà trọ đã lưu',
              onClick: () => window.location.assign('/saved')
            }
          ] : undefined}
        />
      </div>

      <main className="flex-1 flex pt-[72px] overflow-hidden">
        {/* Left Sidebar: Listings List */}
        <aside className={clsx(
          "h-full bg-surface z-10 flex flex-col shadow-xl transition-all duration-300 ease-in-out overflow-hidden",
          isSidebarOpen ? "w-full md:w-[400px] lg:w-[480px]" : "w-0 opacity-0 border-none"
        )}>
          <div className="flex-1 overflow-y-auto search-scrollbar">
          <div className="p-6 space-y-4 flex-1 min-w-[320px]">
            {/* Mobile close bar */}
            <div className="flex items-center justify-between md:hidden -mt-2 mb-1">
              <span className="text-sm font-bold text-on-surface-variant">Danh sách phòng</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-container rounded-full text-sm font-bold text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                Xem bản đồ
              </button>
            </div>
            {/* Search Input Bar */}
            <div className="flex bg-surface-container-high rounded-full p-2">
              <span className="material-symbols-outlined ml-2 mr-2 self-center text-outline">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-on-surface-variant h-full py-2 outline-none"
              />
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={clsx(
                  "flex items-center gap-1 text-sm px-4 rounded-full shadow-sm hover:scale-105 transition-all font-bold relative",
                  isFilterOpen
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest text-primary"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                {t('search.filter')}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-on-error text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel (slideDown) */}
            <SearchFilterPanel
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(DEFAULT_FILTERS)}
              isOpen={isFilterOpen}
            />

            {/* Active Filters Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                  {t('search.results')} <span className="text-primary">({totalResults})</span>
                </h1>
                <div className="flex gap-1 items-center bg-surface-container-low p-1 rounded-lg">
                  {/* Sort dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="group relative p-1.5 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">sort</span>
                      <span className="text-[11px] font-bold hidden lg:inline truncate max-w-[100px]">{currentSortLabel}</span>
                      <span className={`material-symbols-outlined text-[14px] transition-transform ${isSortOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {/* Dropdown menu */}
                    {isSortOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/10 overflow-hidden z-50 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                          {SORT_OPTIONS.map((opt, idx) => (
                            <button
                              key={opt.value}
                              onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }}
                              className={clsx(
                                "w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors text-left",
                                sortBy === opt.value
                                  ? "text-primary bg-primary-container/30 font-bold"
                                  : "text-on-surface-variant hover:bg-surface-container",
                                idx === 0 && "rounded-t-xl",
                                idx === SORT_OPTIONS.length - 1 && "rounded-b-xl"
                              )}
                            >
                              <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                              {opt.label}
                              {sortBy === opt.value && (
                                <span className="material-symbols-outlined text-[16px] ml-auto text-primary">check</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="w-[1px] h-4 bg-outline-variant/50 mx-1" />

                  <button onClick={() => setViewMode('card')} className={clsx("group relative p-1.5 rounded flex items-center justify-center transition-colors", viewMode === 'card' ? "bg-surface-container-lowest text-primary" : "text-on-surface-variant hover:text-on-surface")}>
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-on-surface text-surface text-xs font-bold whitespace-nowrap rounded shadow-ambient opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">{t('search.grid')}<div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-on-surface rotate-45" /></div>
                  </button>
                  <button onClick={() => setViewMode('row')} className={clsx("group relative p-1.5 rounded flex items-center justify-center transition-colors", viewMode === 'row' ? "bg-surface-container-lowest text-primary" : "text-on-surface-variant hover:text-on-surface")}>
                    <span className="material-symbols-outlined text-[18px]">view_list</span>
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-on-surface text-surface text-xs font-bold whitespace-nowrap rounded shadow-ambient opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">{t('search.list')}<div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-on-surface rotate-45" /></div>
                  </button>
                </div>
              </div>

              {/* Active filter pills */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {filters.roomTypes.length > 0 && filters.roomTypes.map(rt => (
                    <span key={rt} className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      {rt}
                      <button onClick={() => setFilters({ ...filters, roomTypes: filters.roomTypes.filter(x => x !== rt) })} className="hover:text-error">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </span>
                  ))}
                  {filters.minRating > 0 && (
                    <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      ★ {filters.minRating}+
                      <button onClick={() => setFilters({ ...filters, minRating: 0 })} className="hover:text-error">
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </span>
                  )}
                  {(filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] || filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) && (
                    <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Giá: {(filters.priceRange[0] / 1000000).toFixed(1)}Tr - {(filters.priceRange[1] / 1000000).toFixed(1)}Tr
                    </span>
                  )}
                </div>
                <button
                  onClick={toggleAll}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 active:scale-95 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">{allHidden ? 'visibility' : 'visibility_off'}</span>
                  {allHidden ? t('search.showAll') : t('search.hideAll')}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-6 pb-20">
              {/* Loading state */}
              {isLoading && (
                <div className="py-16 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold text-on-surface-variant">Đang tải phòng...</span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {!isLoading && apiError && (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-error/50 mb-3 block">cloud_off</span>
                  <p className="font-headline font-bold text-lg text-on-surface mb-1">{apiError}</p>
                  <p className="text-sm text-on-surface-variant mb-4">Kiểm tra kết nối mạng hoặc backend server.</p>
                  <button
                    onClick={() => fetchListings()}
                    className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Thử lại
                  </button>
                </div>
              )}

              {/* Results */}
              {!isLoading && !apiError && filteredListings.length > 0 && (
                filteredListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onHover={setHoveredListingId}
                    viewMode={viewMode}
                    isHidden={hiddenListingIds.has(listing.id)}
                    isSaved={savedListingIds.has(listing.id)}
                    onToggleHide={toggleHide}
                    onToggleSave={onToggleSave}
                  />
                ))
              )}

              {/* Empty state */}
              {!isLoading && !apiError && filteredListings.length === 0 && (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline mb-3 block">search_off</span>
                  <p className="font-headline font-bold text-lg text-on-surface mb-1">Không tìm thấy kết quả</p>
                  <p className="text-sm text-on-surface-variant">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  <button
                    onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(''); }}
                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="py-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => fetchListings(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px] align-middle">chevron_left</span>
                    Trước
                  </button>
                  <span className="text-sm font-bold text-on-surface-variant">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => fetchListings(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 rounded-full text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  >
                    Sau
                    <span className="material-symbols-outlined text-[16px] align-middle">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </aside>

        {/* Right Section: Map */}
        <section className={clsx(
          "flex-1 relative bg-surface-container-low border-l border-outline-variant/20",
          isSidebarOpen ? "hidden md:block" : "block"
        )}>
          {/* Collapse handle on sidebar-map border */}
          {isSidebarOpen && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 z-20">
              <Tooltip content={t('search.collapse')} placement="right">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="hidden md:flex items-center justify-center w-5 h-12 bg-surface hover:bg-primary hover:text-on-primary text-on-surface-variant rounded-r-lg shadow-md transition-all duration-200 border border-l-0 border-outline-variant/20 -ml-[1px]"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
              </Tooltip>
            </div>
          )}
          <MapView
            listings={visibleListings}
            focusedListingId={hoveredListingId}
            isSatellite={isSatellite}
          />

          {/* Map Overlay Elements */}
          <div className="absolute top-6 left-6 flex gap-2 pointer-events-none">
            {!isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(true)}
                className="bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-on-surface pointer-events-auto cursor-pointer hover:bg-surface-container-highest transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">right_panel_open</span>
                {t('search.openSidebar')}
              </div>
            )}

            <div 
              onClick={() => setIsSatellite(!isSatellite)}
              className={clsx(
                "bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold pointer-events-auto cursor-pointer hover:bg-surface-container-highest transition-colors active:scale-95",
                isSatellite ? "text-primary border border-primary/20" : "text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">{isSatellite ? 'navigation' : 'map'}</span>
              {isSatellite ? 'Bản đồ thường' : t('search.satellite')}
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Action — toggle between map and list */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center z-40 active:scale-95 duration-200"
      >
        <span className="material-symbols-outlined text-[28px]">{isSidebarOpen ? 'map' : 'list'}</span>
      </button>
    </div>
  );
}
