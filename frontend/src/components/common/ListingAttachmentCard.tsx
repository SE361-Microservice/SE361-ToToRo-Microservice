import { useNavigate } from 'react-router-dom';

interface ListingAttachmentCardProps {
  listingId: number;
  title: string | null;
  address: string | null;
  coverImage: string | null;
  price: number | null;
  compact?: boolean; // for chat bubbles
}

/**
 * Inline card preview of an attached listing.
 * Click navigates to the listing detail page.
 */
export default function ListingAttachmentCard({
  listingId,
  title,
  address,
  coverImage,
  price,
  compact = false,
}: ListingAttachmentCardProps) {
  const navigate = useNavigate();

  if (!title) {
    // Fallback: just show a simple link
    return (
      <button
        onClick={() => navigate(`/listings/${listingId}`)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined text-[16px]">holiday_village</span>
        Xem phòng #{listingId}
      </button>
    );
  }

  const formatPrice = (p: number) => {
    if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)}tr`;
    if (p >= 1_000) return `${(p / 1_000).toFixed(0)}k`;
    return `${p}đ`;
  };

  if (compact) {
    return (
      <button
        onClick={() => navigate(`/listings/${listingId}`)}
        className="flex items-center gap-3 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-2.5 hover:shadow-md transition-shadow text-left"
      >
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-secondary-container">holiday_village</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">{title}</p>
          {price && (
            <p className="text-xs text-primary font-bold">{formatPrice(price)}/tháng</p>
          )}
        </div>
        <span className="material-symbols-outlined text-outline text-[18px] flex-shrink-0">chevron_right</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/listings/${listingId}`)}
      className="flex gap-3 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all group text-left"
    >
      {/* Cover image */}
      {coverImage ? (
        <img
          src={coverImage}
          alt={title}
          className="w-28 h-24 object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-28 h-24 bg-secondary-container flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-3xl text-on-secondary-container">holiday_village</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 py-2.5 pr-3">
        <p className="font-bold text-on-surface text-sm truncate group-hover:text-primary transition-colors">{title}</p>
        {address && (
          <p className="text-xs text-on-surface-variant truncate mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">location_on</span>
            {address}
          </p>
        )}
        {price && (
          <p className="text-sm font-bold text-primary mt-1.5">
            {formatPrice(price)}<span className="text-xs font-normal text-on-surface-variant">/tháng</span>
          </p>
        )}
      </div>

      <div className="flex items-center pr-3">
        <span className="material-symbols-outlined text-outline text-[18px] group-hover:text-primary transition-colors">chevron_right</span>
      </div>
    </button>
  );
}
