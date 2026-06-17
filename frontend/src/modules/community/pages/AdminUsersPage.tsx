import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import useAuthStore from '../../../store/authStore';
import adminService from '../../../services/adminService';
import type { UserProfileDto } from '../../../types/auth';
import type { PageResponse } from '../../../types/api';
import Modal from '../../../components/core/Modal';
import { useToast } from '../../../hooks/useToast';

const ROLES = ['STUDENT', 'LANDLORD', 'ADMIN'] as const;

const roleLabels: Record<string, string> = {
  STUDENT: 'Sinh viên',
  LANDLORD: 'Chủ nhà',
  ADMIN: 'Quản trị viên',
};

const roleColors: Record<string, string> = {
  STUDENT: 'bg-tertiary-container text-on-tertiary-container',
  LANDLORD: 'bg-secondary-container text-on-secondary-container',
  ADMIN: 'bg-primary-container text-on-primary-container',
};

export default function AdminUsersPage() {
  const toast = useToast();
  const { user: authUser, isAuthenticated } = useAuthStore();

  const adminUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Admin',
    role: 'Quản trị viên',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Role change modal
  const [selectedUser, setSelectedUser] = useState<UserProfileDto | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Block/unblock confirmation
  const [userToBlock, setUserToBlock] = useState<UserProfileDto | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  // User detail modal
  const [detailUser, setDetailUser] = useState<UserProfileDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchUsers = (pageNum: number) => {
    setIsLoading(true);
    adminService.getAllUsersForAdmin(pageNum, 20)
      .then((res: PageResponse<UserProfileDto>) => {
        setUsers(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(err => console.error('Failed to fetch users:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const filteredUsers = searchQuery.trim()
    ? users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : users;

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setIsChangingRole(true);
    try {
      await adminService.changeUserRole(selectedUser.id, newRole);
      toast.success('Thay đổi vai trò người dùng thành công.');
      // Refresh list
      fetchUsers(page);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to change role:', err);
      toast.error('Có lỗi xảy ra khi thay đổi vai trò.');
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleBlockStatusChange = async (user: UserProfileDto, block: boolean) => {
    setIsBlocking(true);
    try {
      await adminService.changeUserBlockStatus(user.id, block);
      toast.success(block ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.');
      // Refresh list
      fetchUsers(page);
      setIsBlockModalOpen(false);
      setUserToBlock(null);
      if (detailUser?.id === user.id) {
        setDetailUser({ ...user, isBlocked: block });
      }
    } catch (err) {
      console.error('Failed to change block status:', err);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái tài khoản.');
    } finally {
      setIsBlocking(false);
    }
  };

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: true },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: false },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: false },
      { icon: 'label', label: 'Quản lý Tag', href: '/admin/tags', active: false },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: false },
    ],
    breakpoint: 'lg',
  }), []);

  return (
    <DashboardLayout sideNavProps={adminSideNav} user={adminUser}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
            Quản lý người dùng
          </h1>
          <p className="text-on-surface-variant font-body">
            Tổng cộng {totalElements} người dùng trên hệ thống
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 placeholder:text-outline text-sm font-body"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-primary-container/30 p-6 rounded-2xl border border-primary-container/50">
          <span className="text-xs font-label font-bold tracking-widest text-primary uppercase">Tổng người dùng</span>
          <p className="text-3xl font-headline font-extrabold mt-1 text-on-primary-container">{totalElements}</p>
        </div>
        <div className="bg-tertiary-container/30 p-6 rounded-2xl border border-tertiary-container/50">
          <span className="text-xs font-label font-bold tracking-widest text-tertiary uppercase">Sinh viên</span>
          <p className="text-3xl font-headline font-extrabold mt-1 text-on-tertiary-container">
            {users.filter(u => u.role === 'STUDENT').length}
          </p>
        </div>
        <div className="bg-secondary-container/30 p-6 rounded-2xl border border-secondary-container/50">
          <span className="text-xs font-label font-bold tracking-widest text-secondary uppercase">Chủ nhà</span>
          <p className="text-3xl font-headline font-extrabold mt-1 text-on-secondary-container">
            {users.filter(u => u.role === 'LANDLORD').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(55,50,34,0.06)]">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-surface-container text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant/60 border-b border-outline-variant/20">
          <div className="col-span-4">Người dùng</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Vai trò</div>
          <div className="col-span-1">Trạng thái</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải danh sách...</span>
            </div>
          </div>
        )}

        {/* User Rows */}
        {!isLoading && filteredUsers.map((user, _idx) => (
          <div
            key={user.email}
            className="grid grid-cols-1 md:grid-cols-12 items-center px-6 py-5 border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors"
          >
            {/* User info */}
            <button
              onClick={() => {
                setDetailUser(user);
                setIsDetailModalOpen(true);
              }}
              className="col-span-4 flex items-center gap-4 text-left w-full hover:opacity-85 transition-opacity cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm uppercase flex-shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName || ''} className="w-full h-full object-cover" />
                ) : (
                  (user.fullName || user.email).charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <p className="font-headline font-bold text-on-surface truncate group-hover:text-primary transition-colors">{user.fullName || 'Chưa cập nhật'}</p>
                <p className="text-xs text-on-surface-variant truncate">{user.university || '—'}</p>
              </div>
            </button>

            {/* Email */}
            <div className="col-span-3">
              <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
            </div>

            {/* Role */}
            <div className="col-span-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${roleColors[user.role] || 'bg-surface-container text-on-surface-variant'}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-1">
              {user.isBlocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-error">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  Đã khóa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Hoạt động
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end items-center gap-2">
              <button
                onClick={() => {
                  setDetailUser(user);
                  setIsDetailModalOpen(true);
                }}
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                title="Xem chi tiết"
              >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
              </button>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setNewRole(user.role);
                  setIsRoleModalOpen(true);
                }}
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                title="Đổi vai trò"
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </button>
              {user.isBlocked ? (
                <button
                  onClick={() => {
                    setUserToBlock(user);
                    setIsBlockModalOpen(true);
                  }}
                  className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                  title="Mở khóa tài khoản"
                >
                  <span className="material-symbols-outlined text-[20px]">settings_backup_restore</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserToBlock(user);
                    setIsBlockModalOpen(true);
                  }}
                  className="p-2 hover:bg-error/10 rounded-full text-error transition-colors"
                  title="Khóa tài khoản"
                >
                  <span className="material-symbols-outlined text-[20px]">block</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty */}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="py-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline mb-3 block">person_off</span>
            <p className="font-headline font-bold text-lg">Không tìm thấy người dùng</p>
            <p className="text-sm mt-1">Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-body text-on-surface-variant">
            Trang {page + 1} / {totalPages} — Hiển thị {filteredUsers.length} / {totalElements}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page < 3 ? i : page - 2 + i;
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-colors ${
                    pageNum === page
                      ? 'bg-primary text-on-primary'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant disabled:opacity-30 transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Thay đổi vai trò">
        <div className="p-6">
          {selectedUser && (
            <>
              <div className="flex items-center gap-4 mb-6 p-4 bg-surface-container rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold uppercase">
                  {(selectedUser.fullName || selectedUser.email).charAt(0)}
                </div>
                <div>
                  <p className="font-headline font-bold">{selectedUser.fullName || selectedUser.email}</p>
                  <p className="text-sm text-on-surface-variant">{selectedUser.email}</p>
                </div>
              </div>

              <p className="text-sm text-on-surface-variant mb-4">Chọn vai trò mới cho người dùng này:</p>
              
              <div className="flex flex-col gap-3">
                {ROLES.map((role) => (
                  <label
                    key={role}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      newRole === role
                        ? 'border-primary bg-primary-container/20'
                        : 'border-outline-variant/20 hover:border-outline-variant/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={newRole === role}
                      onChange={() => setNewRole(role)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-bold text-on-surface">{roleLabels[role]}</p>
                      <p className="text-xs text-on-surface-variant">
                        {role === 'STUDENT' && 'Tìm phòng, ghép bạn ở, đánh giá'}
                        {role === 'LANDLORD' && 'Đăng tin, quản lý phòng trọ'}
                        {role === 'ADMIN' && 'Toàn quyền quản trị hệ thống'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 font-bold text-on-surface hover:bg-surface-container rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={isChangingRole || newRole === selectedUser.role}
                  className="px-6 py-2 font-bold text-on-primary bg-primary hover:opacity-90 rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isChangingRole && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                  Xác nhận
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* User Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Thông tin chi tiết tài khoản">
        <div className="p-6">
          {detailUser && (
            <div className="flex flex-col gap-6">
              {/* Header profile info */}
              <div className="flex items-center gap-4 p-4 bg-surface-container rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xl uppercase overflow-hidden flex-shrink-0">
                  {detailUser.avatarUrl ? (
                    <img src={detailUser.avatarUrl} alt={detailUser.fullName || ''} className="w-full h-full object-cover" />
                  ) : (
                    (detailUser.fullName || detailUser.email).charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">{detailUser.fullName || 'Chưa cập nhật'}</h3>
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${roleColors[detailUser.role] || 'bg-surface-container text-on-surface-variant'}`}>
                    {roleLabels[detailUser.role] || detailUser.role}
                  </span>
                </div>
              </div>

              {/* Detailed specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-bold text-on-surface select-all">{detailUser.email}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Số điện thoại</p>
                  <p className="text-sm font-bold text-on-surface">{detailUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Trường đại học</p>
                  <p className="text-sm font-bold text-on-surface">{detailUser.university || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Trạng thái hoạt động</p>
                  {detailUser.isBlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-error mt-1">
                      <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                      Đã bị khóa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary mt-1">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Hoạt động bình thường
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Giới thiệu bản thân</p>
                <p className="text-sm text-on-surface font-body whitespace-pre-wrap leading-relaxed">{detailUser.bio || 'Chưa cập nhật thông tin giới thiệu.'}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mt-4 border-t border-outline-variant/10 pt-6 justify-end">
                <button
                  onClick={() => {
                    setSelectedUser(detailUser);
                    setNewRole(detailUser.role);
                    setIsRoleModalOpen(true);
                  }}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl font-bold text-sm text-on-surface flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Đổi vai trò
                </button>
                {detailUser.isBlocked ? (
                  <button
                    onClick={() => {
                      setUserToBlock(detailUser);
                      setIsBlockModalOpen(true);
                    }}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                    Mở khóa tài khoản
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setUserToBlock(detailUser);
                      setIsBlockModalOpen(true);
                    }}
                    className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Khóa tài khoản
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant hover:bg-surface-container rounded-xl font-bold text-sm text-on-surface-variant transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Block / Unblock Confirmation Modal */}
      <Modal 
        isOpen={isBlockModalOpen} 
        onClose={() => setIsBlockModalOpen(false)} 
        title={userToBlock?.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản người dùng"}
      >
        <div className="p-6">
          {userToBlock && (
            <>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                {userToBlock.isBlocked ? (
                  <>Bạn có chắc chắn muốn mở khóa cho tài khoản <strong>{userToBlock.fullName || userToBlock.email}</strong>? Sau khi mở khóa, người dùng này sẽ có thể đăng nhập và sử dụng mọi chức năng bình thường.</>
                ) : (
                  <>Bạn có chắc chắn muốn khóa tài khoản <strong>{userToBlock.fullName || userToBlock.email}</strong>? Người dùng bị khóa sẽ không thể truy cập hệ thống và thực hiện các chức năng đăng tin, tìm phòng hay bình luận.</>
                )}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 font-bold text-on-surface hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleBlockStatusChange(userToBlock, !userToBlock.isBlocked)}
                  disabled={isBlocking}
                  className={`px-6 py-2 font-bold text-white rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg cursor-pointer ${
                    userToBlock.isBlocked 
                      ? 'bg-primary hover:opacity-90 shadow-primary/20' 
                      : 'bg-error hover:opacity-90 shadow-error/20'
                  }`}
                >
                  {isBlocking && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                  Xác nhận
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
