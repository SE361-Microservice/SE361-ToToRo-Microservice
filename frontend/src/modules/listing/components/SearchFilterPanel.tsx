import { useState, useEffect } from 'react';
import DualRangeSlider from '../../../components/ui/DualRangeSlider';
import apiClient from '../../../services/apiClient';

// ── Filter state shape ─────────────────────────────────────
export interface SearchFilters {
  priceRange: [number, number];
  areaRange: [number, number];
  roomTypes: string[];         // Vietnamese names matching backend: "Phòng trọ", "Căn hộ mini", etc.
  districts: string[];
  amenities: string[];         // tag slugs: "may-lanh", "cho-de-xe", etc.
  minRating: number;
}

export const DEFAULT_FILTERS: SearchFilters = {
  priceRange: [0, 20000000],
  areaRange: [0, 100],
  roomTypes: [],
  districts: [],
  amenities: [],
  minRating: 0,
};

// ── Sort options ───────────────────────────────────────────
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_desc' | 'rating_desc';

export const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'newest', label: 'Mới nhất', icon: 'schedule' },
  { value: 'price_asc', label: 'Giá thấp → cao', icon: 'trending_up' },
  { value: 'price_desc', label: 'Giá cao → thấp', icon: 'trending_down' },
  { value: 'area_desc', label: 'Diện tích lớn nhất', icon: 'straighten' },
  { value: 'rating_desc', label: 'Đánh giá cao nhất', icon: 'star' },
];

// ── Room types (Vietnamese labels matching seed data) ──────
const ROOM_TYPES: { value: string; label: string }[] = [
  { value: 'Phòng trọ', label: 'Phòng trọ' },
  { value: 'Căn hộ mini', label: 'Căn hộ mini' },
  { value: 'Ký túc xá', label: 'Ký túc xá' },
  { value: 'Nhà nguyên căn', label: 'Nhà nguyên căn' },
  { value: 'Chung cư', label: 'Chung cư' },
];

// ── Wards for location filter (HCM) ──────────────────────
const WARDS = [
  'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
  'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
];

// ── Helpers ────────────────────────────────────────────────
function formatPrice(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}Tr`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}đ`;
}

function formatArea(v: number): string {
  return `${v} m²`;
}

interface TagItem {
  id: number;
  name: string;
  slug: string;
}

interface SearchFilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
}

export default function SearchFilterPanel({ filters, onChange, onClear, isOpen }: SearchFilterPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('price');
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);

  // Fetch real tags from API
  useEffect(() => {
    apiClient.get<TagItem[]>('/tags')
      .then(res => setAvailableTags(res.data))
      .catch(() => {
        // Fallback to static list if API fails
        setAvailableTags([
          { id: 1, name: 'Máy lạnh', slug: 'may-lanh' },
          { id: 2, name: 'Giờ giấc tự do', slug: 'gio-giac-tu-do' },
          { id: 3, name: 'Chỗ để xe', slug: 'cho-de-xe' },
        ]);
      });
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K] extends Array<infer T> ? T : never
  ) => {
    const arr = filters[key] as string[];
    const next = arr.includes(value as string)
      ? arr.filter(v => v !== value)
      : [...arr, value as string];
    onChange({ ...filters, [key]: next });
  };

  const activeCount = [
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] || filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1],
    filters.areaRange[0] !== DEFAULT_FILTERS.areaRange[0] || filters.areaRange[1] !== DEFAULT_FILTERS.areaRange[1],
    filters.roomTypes.length > 0,
    filters.amenities.length > 0,
    filters.districts.length > 0,
    filters.minRating > 0,
  ].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
        <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
          Bộ lọc
          {activeCount > 0 && (
            <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-bold text-error hover:text-error/80 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">clear_all</span>
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="p-5 space-y-1 max-h-[60vh] overflow-y-auto">
        {/* Price Range */}
        <FilterSection
          title="Khoảng giá"
          icon="payments"
          isOpen={expandedSection === 'price'}
          onToggle={() => toggleSection('price')}
          active={filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] || filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]}
        >
          <DualRangeSlider
            min={0}
            max={20000000}
            step={500000}
            value={filters.priceRange}
            onChange={priceRange => onChange({ ...filters, priceRange })}
            formatLabel={formatPrice}
          />
        </FilterSection>

        {/* Room Type */}
        <FilterSection
          title="Loại phòng"
          icon="house"
          isOpen={expandedSection === 'roomType'}
          onToggle={() => toggleSection('roomType')}
          active={filters.roomTypes.length > 0}
        >
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map(rt => (
              <ChipToggle
                key={rt.value}
                label={rt.label}
                active={filters.roomTypes.includes(rt.value)}
                onClick={() => toggleArrayFilter('roomTypes', rt.value)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Area Range */}
        <FilterSection
          title="Diện tích"
          icon="straighten"
          isOpen={expandedSection === 'area'}
          onToggle={() => toggleSection('area')}
          active={filters.areaRange[0] !== DEFAULT_FILTERS.areaRange[0] || filters.areaRange[1] !== DEFAULT_FILTERS.areaRange[1]}
        >
          <DualRangeSlider
            min={0}
            max={100}
            step={5}
            value={filters.areaRange}
            onChange={areaRange => onChange({ ...filters, areaRange })}
            formatLabel={formatArea}
          />
        </FilterSection>

        {/* Ward (Location) */}
        <FilterSection
          title="Phường"
          icon="location_on"
          isOpen={expandedSection === 'district'}
          onToggle={() => toggleSection('district')}
          active={filters.districts.length > 0}
        >
          <div className="flex flex-wrap gap-2">
            {WARDS.map(d => (
              <ChipToggle
                key={d}
                label={d}
                active={filters.districts.includes(d)}
                onClick={() => toggleArrayFilter('districts', d)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Amenities (Tags) */}
        <FilterSection
          title="Tiện ích"
          icon="apps"
          isOpen={expandedSection === 'amenities'}
          onToggle={() => toggleSection('amenities')}
          active={filters.amenities.length > 0}
        >
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <ChipToggle
                key={tag.slug}
                label={tag.name}
                active={filters.amenities.includes(tag.slug)}
                onClick={() => toggleArrayFilter('amenities', tag.slug)}
              />
            ))}
            {availableTags.length === 0 && (
              <span className="text-xs text-on-surface-variant italic">Đang tải...</span>
            )}
          </div>
        </FilterSection>

        {/* Min Rating */}
        <FilterSection
          title="Đánh giá tối thiểu"
          icon="star"
          isOpen={expandedSection === 'rating'}
          onToggle={() => toggleSection('rating')}
          active={filters.minRating > 0}
        >
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map(r => (
              <button
                key={r}
                onClick={() => onChange({ ...filters, minRating: r })}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filters.minRating === r
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {r === 0 ? 'Tất cả' : `${r}★+`}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────
function FilterSection({ title, icon, isOpen, onToggle, active, children }: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline-variant/5 last:border-none">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-sm font-bold text-on-surface hover:text-primary transition-colors group"
      >
        <span className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[18px] ${active ? 'text-primary' : 'text-outline'}`}>{icon}</span>
          {title}
          {active && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
        </span>
        <span className={`material-symbols-outlined text-[18px] text-outline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[300px] pb-4' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

function ChipToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
        active
          ? 'bg-primary-container text-on-primary-container border border-primary/30 shadow-sm'
          : 'bg-surface-container text-on-surface-variant border border-transparent hover:bg-surface-container-high'
      }`}
    >
      {active && <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">check</span>}
      {label}
    </button>
  );
}
