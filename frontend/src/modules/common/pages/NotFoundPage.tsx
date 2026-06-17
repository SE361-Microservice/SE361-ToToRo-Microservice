import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <h1 className="text-[120px] md:text-[160px] font-headline font-black text-primary/15 leading-none select-none">
          404
        </h1>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto -mt-8 mb-6 rounded-full bg-primary-container flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            explore_off
          </span>
        </div>

        {/* Message */}
        <h2 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
          Trang không tồn tại
        </h2>
        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
          Oops! Trang bạn đang tìm không có hoặc đã bị di chuyển.
          <br />Hãy quay lại trang chủ nhé.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/home"
            className="px-6 py-3 btn-gradient text-on-primary font-headline font-bold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            Về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-surface-container border border-outline-variant/20 text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container-high transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
