import { mockProfiles } from '../../../mockData/matchingProfiles';

export default function MatchSidebar() {
  const dailyMatch = mockProfiles[1]; // Anh Tuấn
  const likedBy = mockProfiles.slice(2, 5); // Thu Hà, Đức Minh, Ngọc Trâm

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 flex-col py-8 bg-surface-container rounded-r-[2rem] z-40 shadow-[0_12px_32px_rgba(55,50,34,0.06)]">
      {/* Header */}
      <div className="px-8 mb-10">
        <h2 className="font-headline font-bold text-xl text-primary">Tìm Bạn Ở Ghép</h2>
        <p className="text-on-surface-variant text-sm font-label">Kết nối bạn đồng hành</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        <a className="bg-primary text-on-primary rounded-full mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-transform active:scale-95" href="/matching">
          <span className="material-symbols-outlined">style</span>
          <span className="font-headline font-bold">Tìm Bạn Ở Ghép</span>
        </a>
        <a className="text-on-surface/70 mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-all rounded-full" href="/chat">
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="font-headline">Tin Nhắn</span>
        </a>
        <a className="text-on-surface/70 mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-all rounded-full" href="/saved">
          <span className="material-symbols-outlined">bookmark</span>
          <span className="font-headline">Nhà Đã Lưu</span>
        </a>
        <a className="text-on-surface/70 mx-2 my-1 px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-all rounded-full" href="/search">
          <span className="material-symbols-outlined">home_work</span>
          <span className="font-headline">Housing Hub</span>
        </a>
      </nav>

      {/* Daily match + who likes you */}
      <div className="px-4 mt-8">
        <div className="bg-surface-container-low rounded-lg p-4 space-y-4">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Daily Match</h3>
          <div className="flex items-center gap-3 group cursor-pointer">
            <img alt={dailyMatch.fullName} className="w-12 h-12 rounded-full object-cover" src={dailyMatch.avatar} />
            <div>
              <p className="font-bold text-sm">{dailyMatch.fullName}, {dailyMatch.age}</p>
              <p className="text-xs text-primary font-bold">{dailyMatch.compatibilityScore}% Hợp nhau</p>
            </div>
          </div>

          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mt-6">Ai thích bạn</h3>
          <div className="flex -space-x-3">
            {likedBy.map((p) => (
              <div key={p.id} className="w-10 h-10 rounded-full border-2 border-surface-container overflow-hidden">
                <img alt={p.fullName} className="w-full h-full object-cover" src={p.avatar} />
              </div>
            ))}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-surface-container bg-secondary-container text-on-secondary-container text-xs font-bold">
              +5
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto px-2">
        <button className="w-full btn-gradient text-on-primary py-3 rounded-xl font-bold font-headline mb-4 shadow-lg active:scale-95 transition-transform">
          Nâng cấp Premium
        </button>
        <div className="space-y-1">
          <a className="text-on-surface/70 px-4 py-2 flex items-center gap-3 text-sm hover:bg-primary/10 transition-all rounded-full" href="#">
            <span className="material-symbols-outlined text-xl">settings</span> Cài đặt
          </a>
          <a className="text-on-surface/70 px-4 py-2 flex items-center gap-3 text-sm hover:bg-primary/10 transition-all rounded-full" href="#">
            <span className="material-symbols-outlined text-xl">help_outline</span> Hỗ trợ
          </a>
        </div>
      </div>
    </aside>
  );
}
