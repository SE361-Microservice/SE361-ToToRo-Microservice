import { useState, useEffect, useMemo, useRef } from 'react';
import userService from '../../../services/userService';
import uploadService from '../../../services/uploadService';
import type { UserProfileDto } from '../../../types/auth';
import StudentLayout from '../../../layouts/StudentLayout';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import Button from '../../../components/ui/Button';
import useAuthStore from '../../../store/authStore';
import { useLandlordNav } from '../../../hooks/useLandlordNav';
import AvatarCropperModal from '../../../components/common/AvatarCropperModal';
import { useToast } from '../../../hooks/useToast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser, isAuthenticated } = useAuthStore();
  const toast = useToast();

  const navUser = isAuthenticated && authUser ? {
    name: authUser.fullName || authUser.email,
    avatar: authUser.avatarUrl || '',
    role: authUser.role
  } : undefined;

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar cropper modal state
  const [cropperFile, setCropperFile] = useState<File | null>(null);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getCurrentUser();
      setProfile(data);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setAvatarUrl(data.avatarUrl || '');
      setBio(data.bio || '');
      setUniversity(data.university || '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      const updated = await userService.updateProfile({
        fullName,
        phone,
        avatarUrl,
        bio,
        university
      });
      setProfile(updated);
      // Refresh the global auth store user data
      useAuthStore.getState().fetchCurrentUser();
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warning('Mật khẩu mới không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await userService.changePassword({ oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.', 6000);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password', err);
      toast.error('Sai mật khẩu cũ hoặc có lỗi xảy ra.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropConfirm = async (croppedBlob: Blob) => {
    setCropperFile(null);
    setIsUploading(true);
    try {
      const croppedFile = new File([croppedBlob], 'avatar.webp', { type: 'image/webp' });
      const url = await uploadService.uploadImage(croppedFile);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Failed to upload avatar', err);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const isAdmin = authUser?.role === 'ADMIN';
  const isLandlord = authUser?.role === 'LANDLORD';

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: false },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: false },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: false },
      { icon: 'label', label: 'Quản lý Tag', href: '/admin/tags', active: false },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: false },
    ],
    breakpoint: 'lg',
  }), []);

  const { sideNav: landlordSideNav, landlordUser } = useLandlordNav('profile');

  const renderLayout = (children: React.ReactNode) => {
    if (isAdmin) {
      return (
        <DashboardLayout sideNavProps={adminSideNav} user={navUser}>
          {children}
        </DashboardLayout>
      );
    }
    if (isLandlord) {
      return (
        <DashboardLayout sideNavProps={landlordSideNav} user={landlordUser}>
          {children}
        </DashboardLayout>
      );
    }
    return <StudentLayout user={navUser}>{children}</StudentLayout>;
  };

  // Reusable password input with toggle
  const PasswordInput = ({ label, value, onChange, show, onToggle }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
  }) => (
    <div>
      <label className="block text-sm font-bold text-on-surface-variant mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-container-high rounded-xl px-4 py-3 pr-12 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
          tabIndex={-1}
        >
          <span className="material-symbols-outlined text-xl">
            {show ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return renderLayout(
      <div className="flex justify-center items-center h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      </div>
    );
  }

  return renderLayout(
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-8 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className={`w-24 h-24 rounded-full object-cover border-4 border-surface ${isUploading ? 'opacity-50' : ''}`} />
          ) : (
            <div className={`w-24 h-24 rounded-full bg-primary flex items-center justify-center text-on-primary text-3xl font-bold uppercase border-4 border-surface shadow-sm ${isUploading ? 'opacity-50' : ''}`}>
              {profile?.email?.charAt(0) || 'U'}
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-primary bg-surface/80 rounded-full p-1">sync</span>
            </div>
          )}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Avatar Cropper Modal */}
        {cropperFile && (
          <AvatarCropperModal
            file={cropperFile}
            onConfirm={handleCropConfirm}
            onCancel={() => setCropperFile(null)}
          />
        )}
        <div>
          <h1 className="text-2xl font-headline font-extrabold text-on-surface">{profile?.fullName || 'Người dùng'}</h1>
          <p className="text-on-surface-variant flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            {profile?.email}
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest rounded-full">
            {profile?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Thông tin cá nhân */}
        <section className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <h2 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Thông tin cá nhân
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
              />
            </div>
            
            {!isAdmin && !isLandlord && (
              <>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Trường đại học</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="VD: Đại học Bách Khoa TP.HCM"
                    className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Giới thiệu bản thân</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Viết vài dòng về bạn..."
                    rows={3}
                    className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none"
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={isUpdatingProfile || !fullName.trim() || isUploading} className="w-full mt-2">
              {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </section>

        {/* Đổi mật khẩu */}
        <section className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <h2 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>
            Đổi mật khẩu
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordInput
              label="Mật khẩu hiện tại"
              value={oldPassword}
              onChange={setOldPassword}
              show={showOldPassword}
              onToggle={() => setShowOldPassword(v => !v)}
            />
            <PasswordInput
              label="Mật khẩu mới"
              value={newPassword}
              onChange={setNewPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(v => !v)}
            />
            <PasswordInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(v => !v)}
            />
            <Button type="submit" variant="outline" disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword} className="w-full mt-2">
              {isChangingPassword ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
