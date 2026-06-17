import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { Conversation } from '../../../types/chat';

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Props {
  conversations: Conversation[];
  currentUserId: number;
  isCreating: boolean;
  onClose: () => void;
  onCreate: (name: string, memberIds: number[]) => void;
}

export default function CreateGroupModal({
  conversations,
  currentUserId,
  isCreating,
  onClose,
  onCreate,
}: Props) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Extract unique users from existing conversations (excluding current user)
  const availableUsers = useMemo(() => {
    const userMap = new Map<number, User>();
    conversations.forEach((c) => {
      c.members.forEach((m) => {
        if (m.userId !== currentUserId && !userMap.has(m.userId)) {
          userMap.set(m.userId, {
            id: m.userId,
            name: m.user.name,
            avatar: m.user.avatar,
          });
        }
      });
    });
    return Array.from(userMap.values());
  }, [conversations, currentUserId]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return availableUsers;
    return availableUsers.filter((u) => u.name.toLowerCase().includes(q));
  }, [availableUsers, memberSearch]);

  const toggleMember = (user: User) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === user.id)
        ? prev.filter((m) => m.id !== user.id)
        : [...prev, user]
    );
  };

  const handleSubmit = () => {
    if (!groupName.trim()) return;
    onCreate(
      groupName.trim(),
      selectedMembers.map((m) => m.id)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-outline-variant/10">
          <h3 className="font-headline text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group_add</span>
            Tạo nhóm chat mới
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Đặt tên và chọn thành viên cho nhóm
          </p>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Group name */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Tên nhóm
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="VD: Nhóm tìm trọ Q.Bình Thạnh"
              className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          {/* Selected members chips */}
          {selectedMembers.length > 0 && (
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                Đã chọn ({selectedMembers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m)}
                    className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors group"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    {m.name}
                    <span className="material-symbols-outlined text-[14px] opacity-60 group-hover:opacity-100">
                      close
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Member search + list */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Thêm thành viên
            </label>
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Tìm kiếm người dùng..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              />
            </div>

            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center py-6 text-sm text-outline">
                  {memberSearch
                    ? 'Không tìm thấy người dùng'
                    : 'Chưa có cuộc trò chuyện nào để lấy danh sách'}
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedMembers.some(
                    (m) => m.id === user.id
                  );
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleMember(user)}
                      className={clsx(
                        'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors',
                        isSelected
                          ? 'bg-primary-container/30 border border-primary/20'
                          : 'hover:bg-surface-container border border-transparent'
                      )}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="flex-1 text-sm font-medium text-on-surface truncate">
                        {user.name}
                      </span>
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-outline-variant'
                        )}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-on-primary text-[14px]">
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 pt-4 border-t border-outline-variant/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-bold text-on-surface bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!groupName.trim() || isCreating}
            className="px-5 py-2.5 font-bold text-on-primary bg-primary hover:opacity-90 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isCreating && (
              <span className="material-symbols-outlined animate-spin text-[16px]">
                sync
              </span>
            )}
            Tạo nhóm
            {selectedMembers.length > 0 && (
              <span className="bg-on-primary/20 text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                +{selectedMembers.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
