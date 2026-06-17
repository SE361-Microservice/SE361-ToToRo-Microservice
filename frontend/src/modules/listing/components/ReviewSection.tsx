import { useState, useMemo } from 'react';
import type { ListingReview } from '../../../types/listing';

interface ReviewSectionProps {
  reviews: ListingReview[];
  avgRating: number;
  reviewCount: number;
  onSubmit?: (review: { rating: number; comment: string }) => void;
}

// ── Star renderer ──────────────────────────────────────────
function Stars({ rating, size = 18, interactive = false, onRate }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            className={`transition-all duration-150 ${interactive ? 'cursor-pointer hover:scale-125 active:scale-95' : 'cursor-default'}`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: size, color: filled ? 'var(--md-sys-color-tertiary, #e6a817)' : 'var(--md-sys-color-outline-variant, #ccc)' }}
            >
              {filled ? 'star' : 'star_border'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Distribution bar ───────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right font-bold text-on-surface-variant">{star}</span>
      <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--md-sys-color-tertiary, #e6a817)' }}>star</span>
      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--md-sys-color-tertiary, #e6a817), var(--md-sys-color-primary, #4a7c59))',
          }}
        />
      </div>
      <span className="w-6 text-right text-xs text-on-surface-variant font-bold">{count}</span>
    </div>
  );
}

// ── Single review card ─────────────────────────────────────
function ReviewCard({ review }: { review: ListingReview }) {
  const date = new Date(review.createdAt);
  const timeAgo = getTimeAgo(date);

  const subRatings = [
    { label: 'Vệ sinh', value: review.ratingCleanliness },
    { label: 'An ninh', value: review.ratingSecurity },
    { label: 'Chủ trọ', value: review.ratingLandlord },
    { label: 'Đúng mô tả', value: review.ratingAccuracy },
  ].filter(s => s.value && s.value > 0);

  return (
    <div className="py-6 border-b border-outline-variant/10 last:border-none group/review">
      <div className="flex gap-3 items-start">
        <img
          src={review.userAvatar}
          alt={review.userName}
          className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-high flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-on-surface">{review.userName}</span>
            <span className="text-xs text-outline">•</span>
            <span className="text-xs text-on-surface-variant">{timeAgo}</span>
          </div>
          <Stars rating={review.rating} size={16} />

          {/* Sub-ratings */}
          {subRatings.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {subRatings.map(s => (
                <span key={s.label} className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg">
                  <span className="font-bold">{s.label}</span>
                  <span className="material-symbols-outlined text-[12px]" style={{ color: 'var(--md-sys-color-tertiary, #e6a817)' }}>star</span>
                  <span className="font-bold text-on-surface">{s.value}</span>
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 text-on-surface-variant leading-relaxed text-[15px]">{review.comment}</p>

          {/* Upvote count */}
          {(review.upvoteCount ?? 0) > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">thumb_up</span>
              <span className="font-bold">{review.upvoteCount}</span> người thấy hữu ích
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

// ── Main component ─────────────────────────────────────────
export default function ReviewSection({ reviews, avgRating, reviewCount, onSubmit }: ReviewSectionProps) {
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [formErrors, setFormErrors] = useState<{ rating?: string; comment?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  // Distribution
  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // index 0=1★, 4=5★
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    return dist;
  }, [reviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (formRating === 0) errors.rating = 'Vui lòng chọn số sao';
    if (formComment.trim().length < 10) errors.comment = 'Bình luận tối thiểu 10 ký tự';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSubmit?.({ rating: formRating, comment: formComment.trim() });
    setSubmitted(true);
    setFormRating(0);
    setFormComment('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div id="reviews">
      <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">reviews</span>
        Đánh giá & Nhận xét
      </h3>

      {/* Summary row */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
        {/* Big rating number */}
        <div className="flex flex-col items-center justify-center min-w-[140px]">
          <span className="text-5xl font-headline font-extrabold text-on-surface">{avgRating.toFixed(1)}</span>
          <Stars rating={avgRating} size={22} />
          <span className="text-sm text-on-surface-variant mt-1 font-bold">{reviewCount} đánh giá</span>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map(star => (
            <RatingBar key={star} star={star} count={distribution[star - 1]} total={reviewCount} />
          ))}
        </div>
      </div>

      {/* Review list */}
      <div className="mb-8">
        {reviews.length > 0 ? (
          reviews.map(review => <ReviewCard key={review.id} review={review} />)
        ) : (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 block">rate_review</span>
            <p className="font-bold">Chưa có đánh giá nào</p>
            <p className="text-sm">Hãy là người đầu tiên đánh giá phòng này!</p>
          </div>
        )}
      </div>

      {/* Write review form */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
        <h4 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
          Viết đánh giá của bạn
        </h4>

        {submitted ? (
          <div className="flex items-center gap-3 py-6 text-primary animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-[28px]">check_circle</span>
            <span className="font-bold">Cảm ơn bạn đã đánh giá! Nhận xét của bạn sẽ được hiển thị sau khi xác nhận.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selector */}
            <div>
              <label className="text-sm font-bold text-on-surface-variant block mb-2">Đánh giá sao *</label>
              <div className="flex items-center gap-3">
                <Stars rating={formRating} size={28} interactive onRate={setFormRating} />
                {formRating > 0 && (
                  <span className="text-sm font-bold text-on-surface-variant animate-in fade-in duration-200">
                    {['', 'Tệ', 'Dưới trung bình', 'Trung bình', 'Tốt', 'Tuyệt vời'][formRating]}
                  </span>
                )}
              </div>
              {formErrors.rating && (
                <p className="text-error text-xs mt-1 font-bold">{formErrors.rating}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-bold text-on-surface-variant block mb-2">Nhận xét *</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                rows={4}
                className="w-full bg-surface-container-high text-on-surface rounded-xl px-4 py-3 text-sm border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none placeholder:text-on-surface-variant/50"
              />
              <div className="flex justify-between mt-1">
                {formErrors.comment && (
                  <p className="text-error text-xs font-bold">{formErrors.comment}</p>
                )}
                <span className={`text-xs ml-auto ${formComment.length < 10 ? 'text-outline' : 'text-primary'} font-bold`}>
                  {formComment.length}/500
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-gradient-to-br from-primary to-primary-dim text-on-primary px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Gửi đánh giá
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
