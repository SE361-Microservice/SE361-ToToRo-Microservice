import { useState } from 'react';
import userService from '../../../services/userService';
import useAuthStore from '../../../store/authStore';

interface Props {
  onComplete: (role: 'USER' | 'LANDLORD') => void;
}

/**
 * Shown once after a new Google sign-up.
 * Asks the user to pick their role and fill in basic profile info.
 */
export default function CompleteProfileModal({ onComplete }: Props) {
  const [selectedRole, setSelectedRole] = useState<'USER' | 'LANDLORD' | null>(null);
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsSubmitting(true);
    setError('');
    try {
      await userService.completeOnboarding({
        role: selectedRole,
        phone: phone || undefined,
        university: selectedRole === 'USER' ? university || undefined : undefined,
        bio: bio || undefined,
      });
      // Refresh auth store so the updated role is reflected everywhere
      await fetchCurrentUser();
      onComplete(selectedRole);
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Full-screen overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-secondary p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-white text-3xl">waving_hand</span>
          </div>
          <h2 className="text-2xl font-headline font-extrabold text-white">Chào mừng đến ToToRo!</h2>
          <p className="text-white/80 text-sm mt-1">Hãy cho chúng tôi biết thêm về bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role selection */}
          <div>
            <p className="text-sm font-bold text-on-surface-variant mb-3">
              Bạn đang tìm kiếm với tư cách nào? <span className="text-error">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Student card */}
              <button
                type="button"
                onClick={() => setSelectedRole('USER')}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === 'USER'
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-outline-variant bg-surface-container hover:border-primary/50 text-on-surface'
                }`}
              >
                {selectedRole === 'USER' && (
                  <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-base">
                    check_circle
                  </span>
                )}
                <span className="material-symbols-outlined text-3xl">school</span>
                <div className="text-center">
                  <p className="font-bold text-sm">Học sinh / Sinh viên</p>
                  <p className="text-xs opacity-70 mt-0.5">Tìm phòng trọ</p>
                </div>
              </button>

              {/* Landlord card */}
              <button
                type="button"
                onClick={() => setSelectedRole('LANDLORD')}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === 'LANDLORD'
                    ? 'border-secondary bg-secondary-container text-on-secondary-container'
                    : 'border-outline-variant bg-surface-container hover:border-secondary/50 text-on-surface'
                }`}
              >
                {selectedRole === 'LANDLORD' && (
                  <span className="absolute top-2 right-2 material-symbols-outlined text-secondary text-base">
                    check_circle
                  </span>
                )}
                <span className="material-symbols-outlined text-3xl">home_work</span>
                <div className="text-center">
                  <p className="font-bold text-sm">Chủ trọ / Chủ nhà</p>
                  <p className="text-xs opacity-70 mt-0.5">Đăng tin cho thuê</p>
                </div>
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                phone
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
                className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-on-surface"
              />
            </div>
          </div>

          {/* University — only for students */}
          {selectedRole === 'USER' && (
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-1">
                Trường đại học / Cao đẳng
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                  apartment
                </span>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="VD: Đại học Bách Khoa TP.HCM"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-on-surface"
                />
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1">
              Giới thiệu bản thân <span className="text-on-surface-variant font-normal">(tuỳ chọn)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Viết vài dòng về bạn..."
              rows={2}
              className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-on-surface resize-none"
            />
          </div>

          {error && (
            <p className="text-error text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedRole || isSubmitting}
            className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                Bắt đầu khám phá
              </>
            )}
          </button>

          <p className="text-center text-xs text-on-surface-variant">
            Bạn có thể cập nhật thông tin này bất cứ lúc nào trong phần{' '}
            <span className="font-semibold text-primary">Hồ sơ cá nhân</span>
          </p>
        </form>
      </div>
    </div>
  );
}
