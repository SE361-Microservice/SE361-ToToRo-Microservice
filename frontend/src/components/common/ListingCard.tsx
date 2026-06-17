import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Listing } from '../../types/listing';
import Tooltip from '../ui/Tooltip';

interface ListingCardProps {
  listing: Listing;
  onHover?: (id: string | null) => void;
  viewMode?: 'card' | 'row';
  isHidden?: boolean;
  isSaved?: boolean;
  onToggleHide?: (id: string, e: React.MouseEvent) => void;
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onClick?: () => void;
  className?: string;
}

export default function ListingCard({ listing, onHover, viewMode = 'card', isHidden = false, isSaved = false, onToggleHide, onToggleSave, onClick, className }: ListingCardProps) {
  const coverImage = listing.images?.find(img => img.isCover)?.url || listing.images?.[0]?.url;
  
  // Format price
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace('.0', '')}Tr`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={clsx(
        'group/card bg-surface-container-lowest rounded-lg overflow-hidden border-none transition-all duration-300 hover:shadow-[0_12px_32px_rgba(55,50,34,0.06)] cursor-pointer flex',
        viewMode === 'row' ? 'flex-row h-40' : 'flex-col',
        isHidden && 'opacity-50 grayscale-[0.5]',
        className
      )}
    >
      <div className={clsx("relative", viewMode === 'row' ? 'w-40 h-full flex-shrink-0' : 'h-56 w-full')}>
        {coverImage ? (
          <img 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            src={coverImage}
            alt={listing.title} 
          />
        ) : (
          <div className="w-full h-full bg-surface-variant flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-4xl">home</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2">
          {onToggleHide && (
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleHide(listing.id, e); }}
              className="group relative bg-surface/80 backdrop-blur-md p-2 rounded-full text-on-surface-variant hover:text-primary active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isHidden ? 'visibility_off' : 'visibility'}
              </span>
              {/* Tooltip */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-on-surface text-surface text-xs font-bold whitespace-nowrap rounded shadow-ambient opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                {isHidden ? 'Hiện lại trên bản đồ' : 'Ẩn khỏi bản đồ'}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-on-surface rotate-45"></div>
              </div>
            </button>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(listing.id, e);
            }}
            className={clsx(
              "bg-surface/80 backdrop-blur-md p-2 rounded-full active:scale-90 transition-transform",
              isSaved ? "text-error" : "text-on-surface-variant hover:text-error"
            )}
          >
            <span 
              className="material-symbols-outlined text-[18px]"
              style={isSaved ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
        </div>
        
        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {listing.status === 'ACTIVE' && (
            <span className="bg-primary/90 text-on-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Mới Nhất
            </span>
          )}
        </div>
      </div>
      
      <div className={clsx("p-4 flex-1 flex flex-col min-w-0", viewMode === 'row' && "justify-between")}>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-headline text-lg font-bold leading-tight truncate flex-1" title={listing.title}>
            {listing.title}
          </h3>
          <div className="text-right whitespace-nowrap flex-shrink-0 ml-2">
            <span className="text-primary font-extrabold text-xl">{formatPrice(listing.priceRent)}</span>
            <span className="text-on-surface-variant text-xs font-medium block">/tháng</span>
          </div>
        </div>
        
        <p className={clsx("text-on-surface-variant text-sm flex items-center gap-1 truncate", viewMode !== 'row' && "mb-4")}>
          <span className="material-symbols-outlined text-[16px] flex-shrink-0">location_on</span>
        </p>
        
        <div className={clsx("flex flex-wrap gap-2 overflow-hidden", viewMode === 'row' ? 'hidden' : 'mb-4')}>
          <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">
            {listing.areaM2} m²
          </span>
          {listing.tags?.slice(0, 3).map(tag => (
            <span key={tag.id} className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">
              {tag.name}
            </span>
          ))}
        </div>
        
        <div className="mt-auto pt-2">
          {viewMode !== 'row' && <div className="h-[1px] bg-outline-variant/10 mb-4"></div>}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
              <span className="text-xs font-bold text-on-surface-variant">Chính chủ</span>
              {listing.avgRating != null && listing.avgRating > 0 && (
                <>
                  <span className="text-outline text-xs">•</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold">
                    <span className="material-symbols-outlined text-[14px]" style={{ color: '#e6a817' }}>star</span>
                    <span className="text-on-surface">{listing.avgRating}</span>
                    {listing.reviewCount != null && (
                      <span className="text-on-surface-variant">({listing.reviewCount})</span>
                    )}
                  </span>
                </>
              )}
            </div>
            
            {viewMode === 'row' ? (
              <Tooltip content="Xem Chi Tiết" placement="top">
                <Link 
                  to={`/listings/${listing.id}`}
                  className="bg-primary text-on-primary w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </Tooltip>
            ) : (
              <Link 
                to={`/listings/${listing.id}`}
                className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity active:scale-95 text-center"
              >
                Xem Chi Tiết
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
