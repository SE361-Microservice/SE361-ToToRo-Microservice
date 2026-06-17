import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import tagService from '../../../services/tagService';
import type { TagDto } from '../../../types/listing';
import Button from '../../../components/ui/Button';
import useAuthStore from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../hooks/useConfirm';
import Modal from '../../../components/core/Modal';

const COMMON_ICONS = [
  'ac_unit', 'kitchen', 'wifi', 'local_parking', 'elevator', 
  'tv', 'local_laundry_service', 'balcony', 'mode_fan', 
  'single_bed', 'desk', 'chair', 'light', 'door_front', 
  'meeting_room', 'security', 'pets', 'smoke_free', 
  'group', 'flatware', 'ironing', 'checkroom', 'microwave',
  'directions_car', 'two_wheeler', 'pedal_bike', 'fitness_center',
  'pool', 'local_cafe', 'restaurant', 'storefront', 'local_hospital',
  'school', 'park', 'wc', 'bathtub', 'shower', 'water_drop',
  'bolt', 'local_fire_department', 'videocam', 'key',
  'home', 'apartment', 'house', 'domain', 'store', 'sell'
];

export default function AdminTagsPage() {
  const toast = useToast();
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [tags, setTags] = useState<TagDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create Tag Form
  const [newTagName, setNewTagName] = useState('');
  const [newTagIcon, setNewTagIcon] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit Tag Modal state
  const [editingTag, setEditingTag] = useState<TagDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const confirmFn = useConfirm();

  const adminUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Admin',
    role: 'Quản trị viên',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: false },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: false },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: false },
      { icon: 'label', label: 'Quản lý Tag', href: '/admin/tags', active: true },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: false },
    ],
    breakpoint: 'lg',
  }), []);

  const loadTags = () => {
    setIsLoading(true);
    tagService.getAll()
      .then(res => setTags(res))
      .catch(err => console.error('Failed to fetch tags', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    setIsCreating(true);
    try {
      await tagService.create(newTagName.trim(), newTagIcon.trim() || undefined);
      setNewTagName('');
      setNewTagIcon('');
      loadTags();
    } catch (err) {
      console.error('Failed to create tag', err);
      toast.error('Lỗi khi tạo tag mới.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (id: number) => {
    const ok = await confirmFn({
      title: 'Xóa tag',
      message: 'Bạn có chắc chắn muốn xóa tag này? Các tin đăng chứa tag này sẽ bị mất liên kết.',
      confirmLabel: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await tagService.delete(id);
      loadTags();
    } catch (err) {
      console.error('Failed to delete tag', err);
      toast.error('Lỗi khi xóa tag. Có thể tag này đang được sử dụng trong tin đăng.');
    }
  };

  const handleEditTag = (tag: TagDto) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditIcon(tag.icon || '');
  };

  const handleSaveEditTag = async () => {
    if (!editingTag || !editName.trim()) return;
    try {
      await tagService.update(editingTag.id, editName.trim(), editIcon.trim() || undefined);
      setEditingTag(null);
      loadTags();
    } catch (err) {
      console.error('Failed to update tag', err);
      toast.error('Lỗi khi cập nhật tag.');
    }
  };

  return (
    <DashboardLayout sideNavProps={adminSideNav} user={adminUser}>
      <header className="mb-10">
        <p className="text-xs font-label uppercase tracking-widest text-outline mb-2">Hệ thống</p>
        <h1 className="font-headline text-4xl font-extrabold text-on-background tracking-tight mb-2">
          Quản Lý Tag
        </h1>
        <p className="text-on-surface-variant max-w-2xl">
          Tạo và quản lý các tiện ích/nhãn dán cho tin đăng (máy lạnh, gác lửng, ban công...).
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl font-bold">Danh sách Tag hệ thống</h3>
              <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-bold text-sm rounded-full">
                {tags.length} tags
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
              </div>
            ) : tags.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">label_off</span>
                <p>Chưa có tag nào trong hệ thống.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">{tag.icon || 'sell'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{tag.name}</p>
                        <p className="text-xs text-on-surface-variant font-mono">{tag.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditTag(tag)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                        title="Chỉnh sửa tag"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors"
                        title="Xóa tag"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient sticky top-24">
            <h3 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              Thêm Tag Mới
            </h3>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Tên Tag (Tiếng Việt)</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="VD: Có máy lạnh"
                  className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1">Icon (Tên Material Symbol)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant">
                    {newTagIcon || 'search'}
                  </span>
                  <input
                    type="text"
                    value={newTagIcon}
                    onChange={(e) => setNewTagIcon(e.target.value)}
                    placeholder="Chọn từ danh sách hoặc nhập mã"
                    className="w-full bg-surface-container-high rounded-xl pl-12 pr-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                {/* Icon Picker Grid */}
                <div className="mt-2 grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 custom-scrollbar">
                  {COMMON_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewTagIcon(icon)}
                      className={`aspect-square flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors ${
                        newTagIcon === icon 
                          ? 'bg-primary text-on-primary hover:bg-primary' 
                          : 'text-on-surface-variant'
                      }`}
                      title={icon}
                    >
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-secondary-container/50 rounded-xl text-xs text-on-surface-variant">
                <span className="font-bold text-on-secondary-container">Lưu ý:</span> Slug (đường dẫn URL) sẽ được tự động tạo từ tên tag. VD: "Có máy lạnh" -&gt; "co-may-lanh". Icon sử dụng bộ Google Material Symbols.
              </div>
              <Button type="submit" disabled={isCreating || !newTagName.trim()} className="w-full">
                {isCreating ? 'Đang tạo...' : 'Tạo Tag'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Edit Tag Modal */}
      <Modal isOpen={!!editingTag} onClose={() => setEditingTag(null)} title="Chỉnh sửa Tag">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Tên Tag</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">Icon (Material Symbol name)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant">
                {editIcon || 'search'}
              </span>
              <input
                type="text"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                placeholder="Chọn từ danh sách hoặc nhập mã"
                className="w-full bg-surface-container-high rounded-xl pl-12 pr-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              />
            </div>
            {/* Icon Picker Grid */}
            <div className="mt-2 grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-2 bg-surface-container-lowest rounded-xl border border-outline-variant/20 custom-scrollbar">
              {COMMON_ICONS.map(icon => (
                <button
                  key={`edit-${icon}`}
                  type="button"
                  onClick={() => setEditIcon(icon)}
                  className={`aspect-square flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors ${
                    editIcon === icon 
                      ? 'bg-primary text-on-primary hover:bg-primary' 
                      : 'text-on-surface-variant'
                  }`}
                  title={icon}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setEditingTag(null)}>Hủy</Button>
            <Button className="flex-1" disabled={!editName.trim()} onClick={handleSaveEditTag}>Lưu thay đổi</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
