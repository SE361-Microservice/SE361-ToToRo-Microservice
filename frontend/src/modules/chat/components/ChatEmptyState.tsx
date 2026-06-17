export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-outline text-4xl">forum</span>
      </div>
      <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Chào mừng đến Tin nhắn!</h3>
      <p className="text-sm text-on-surface-variant max-w-sm">
        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin, 
        hoặc tìm bạn cùng phòng để kết nối.
      </p>
    </div>
  );
}
