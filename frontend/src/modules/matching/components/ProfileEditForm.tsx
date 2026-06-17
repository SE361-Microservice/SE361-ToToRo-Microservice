import { useEffect, useState } from 'react';
import type { RoommateProfile, Gender, SleepTime, WakeTime } from '../../../types/matching';
import type { Province, Ward } from '../../../types/location';
import { locationService } from '../../../services/locationService';
import { useToast } from '../../../hooks/useToast';

interface ProfileEditFormProps {
  /** Existing profile for editing, or undefined if creating new */
  initialProfile?: Partial<RoommateProfile>;
  onSave: (profile: Partial<RoommateProfile>) => void;
}

export default function ProfileEditForm({ initialProfile, onSave }: ProfileEditFormProps) {
  const toast = useToast();
  
  const [form, setForm] = useState({
    fullName: initialProfile?.fullName ?? '',
    age: initialProfile?.age ?? 20,
    gender: initialProfile?.gender ?? ('' as Gender | ''),
    university: initialProfile?.university ?? '',
    budgetMin: initialProfile?.budgetMin ? initialProfile.budgetMin / 1000000 : 2,
    budgetMax: initialProfile?.budgetMax ? initialProfile.budgetMax / 1000000 : 4,
    preferredCity: initialProfile?.preferredCity ?? '',
    preferredWard: initialProfile?.preferredWard ?? '',
    sleepTime: initialProfile?.sleepTime ?? ('' as SleepTime | ''),
    wakeTime: initialProfile?.wakeTime ?? ('' as WakeTime | ''),
    cleanliness: initialProfile?.cleanliness 
      ? Math.max(1, Math.min(5, initialProfile.cleanliness)) 
      : 3,
    isSmoker: initialProfile?.isSmoker ?? false,
    drinksAlcohol: initialProfile?.drinksAlcohol ?? false,
    hasPets: initialProfile?.hasPets ?? false,
    isIntrovert: initialProfile?.isIntrovert ?? undefined as boolean | undefined,
    okWithSmoker: initialProfile?.okWithSmoker ?? false,
    okWithPets: initialProfile?.okWithPets ?? true,
    bio: initialProfile?.bio ?? '',
  });

  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    locationService.getProvinces().then(setProvinces).catch(console.error);
  }, []);

  // Normalize initial/loaded preferredCity name to match province name in provinces list
  useEffect(() => {
    if (provinces.length > 0 && form.preferredCity) {
      const p = provinces.find(x => 
        x.name === form.preferredCity ||
        x.name.replace(/^(Thành phố|Tỉnh)\s+/i, '') === form.preferredCity.replace(/^(Thành phố|Tỉnh)\s+/i, '')
      );
      if (p && p.name !== form.preferredCity) {
        setForm(prev => ({ ...prev, preferredCity: p.name }));
      }
    }
  }, [provinces, form.preferredCity]);

  useEffect(() => {
    if (form.preferredCity) {
      // form.preferredCity is the province name. Let's find the province code by name to fetch wards.
      const p = provinces.find(x => x.name === form.preferredCity);
      if (p) {
        locationService.getWardsByProvince(p.code).then(setWards).catch(console.error);
      } else {
        setWards([]);
      }
    } else {
      setWards([]);
    }
  }, [form.preferredCity, provinces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      gender: form.gender || undefined,
      sleepTime: (form.sleepTime || undefined) as SleepTime | undefined,
      wakeTime: (form.wakeTime || undefined) as WakeTime | undefined,
      budgetMin: form.budgetMin * 1000000,
      budgetMax: form.budgetMax * 1000000,
    });
    toast.success('Hồ sơ tìm bạn ở ghép đã được cập nhật thành công!');
  };

  const labelClass = 'font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5 block';
  const inputClass = 'w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-sm font-body text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all';
  const selectClass = inputClass + ' appearance-none cursor-pointer';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline font-extrabold text-2xl text-on-surface">Hồ sơ tìm bạn ở ghép</h2>
        <p className="text-on-surface-variant text-sm mt-1">Hoàn thiện hồ sơ để AI ghép bạn với người phù hợp nhất</p>
      </div>

      {/* Section: Basic Info */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(55,50,34,0.04)] space-y-5">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Họ tên</label>
            <input className={inputClass} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className={labelClass}>Tuổi</label>
            <input type="number" className={inputClass} value={form.age} onChange={(e) => update('age', Number(e.target.value))} min={16} max={40} />
          </div>
          <div>
            <label className={labelClass}>Giới tính</label>
            <select className={selectClass} value={form.gender} onChange={(e) => update('gender', e.target.value as Gender | '')}>
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Trường đại học</label>
            <input className={inputClass} value={form.university} onChange={(e) => update('university', e.target.value)} placeholder="Đại học Bách Khoa TP.HCM" />
          </div>
        </div>
      </section>

      {/* Section: Budget & Location */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(55,50,34,0.04)] space-y-5">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">payments</span>
          Ngân sách & Vị trí
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tối thiểu (triệu VNĐ)</label>
            <input type="number" className={inputClass} value={form.budgetMin} onChange={(e) => update('budgetMin', Number(e.target.value))} min={0} step={0.5} />
          </div>
          <div>
            <label className={labelClass}>Tối đa (triệu VNĐ)</label>
            <input type="number" className={inputClass} value={form.budgetMax} onChange={(e) => update('budgetMax', Number(e.target.value))} min={0} step={0.5} />
          </div>
        </div>

        {/* Preferred Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tỉnh/Thành ưa thích</label>
            <select
              className={selectClass}
              value={form.preferredCity}
              onChange={(e) => {
                update('preferredCity', e.target.value);
                update('preferredWard', ''); // Reset ward on province change
              }}
            >
              <option value="">Chọn Tỉnh/Thành phố</option>
              {provinces.map(p => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Phường/Xã ưa thích</label>
            <select
              className={selectClass}
              value={form.preferredWard}
              onChange={(e) => update('preferredWard', e.target.value)}
              disabled={!form.preferredCity}
            >
              <option value="">Chọn Phường/Xã</option>
              {(() => {
                const seen = new Set();
                return wards
                  .filter(w => {
                    const norm = w.name?.trim().toLowerCase();
                    if (!norm || seen.has(norm)) return false;
                    seen.add(norm);
                    return true;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                  .map(w => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ));
              })()}
            </select>
          </div>
        </div>
      </section>

      {/* Section: Lifestyle */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(55,50,34,0.04)] space-y-5">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">self_improvement</span>
          Phong cách sống
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Giờ ngủ</label>
            <select className={selectClass} value={form.sleepTime} onChange={(e) => update('sleepTime', e.target.value as SleepTime | '')}>
              <option value="">Chọn</option>
              <option value="early">Sớm (trước 22h)</option>
              <option value="normal">Bình thường (22h-0h)</option>
              <option value="late">Muộn (0h-2h)</option>
              <option value="very_late">Rất muộn (sau 2h)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Giờ dậy</label>
            <select className={selectClass} value={form.wakeTime} onChange={(e) => update('wakeTime', e.target.value as WakeTime | '')}>
              <option value="">Chọn</option>
              <option value="early">Sớm (trước 7h)</option>
              <option value="normal">Bình thường (7h-9h)</option>
              <option value="late">Muộn (sau 9h)</option>
            </select>
          </div>
        </div>

        {/* Cleanliness slider */}
        <div>
          <label className={labelClass}>Mức độ gọn gàng</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1} max={5} step={1}
              value={form.cleanliness}
              onChange={(e) => update('cleanliness', Number(e.target.value))}
              className="flex-1 h-2 rounded-full accent-primary"
            />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={`material-symbols-outlined text-lg ${i <= form.cleanliness ? 'text-primary' : 'text-outline-variant/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([
            { key: 'isSmoker' as const, icon: 'smoking_rooms', label: 'Hút thuốc' },
            { key: 'drinksAlcohol' as const, icon: 'local_bar', label: 'Uống rượu' },
            { key: 'hasPets' as const, icon: 'pets', label: 'Nuôi thú cưng' },
          ]).map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => update(key, !form[key])}
              className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-bold transition-all ${
                form[key]
                  ? 'bg-primary-container border-primary text-on-primary-container'
                  : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
              }`}
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Personality */}
        <div>
          <label className={labelClass}>Tính cách</label>
          <div className="flex gap-3">
            {([
              { value: true, icon: 'menu_book', label: 'Hướng nội' },
              { value: false, icon: 'groups', label: 'Hướng ngoại' },
            ] as const).map(({ value, icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => update('isIntrovert', form.isIntrovert === value ? undefined : value)}
                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  form.isIntrovert === value
                    ? 'bg-primary-container border-primary text-on-primary-container'
                    : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
                }`}
              >
                <span className="material-symbols-outlined text-base">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Preferences */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(55,50,34,0.04)] space-y-5">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">tune</span>
          Chấp nhận bạn ở cùng
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'okWithSmoker' as const, icon: 'smoking_rooms', label: 'Hút thuốc' },
            { key: 'okWithPets' as const, icon: 'pets', label: 'Nuôi thú cưng' },
          ]).map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => update(key, !form[key])}
              className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-bold transition-all ${
                form[key]
                  ? 'bg-tertiary-container border-tertiary text-on-tertiary-container'
                  : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:border-tertiary/30'
              }`}
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              OK với {label}
            </button>
          ))}
        </div>
      </section>

      {/* Section: Bio */}
      <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-[0_4px_16px_rgba(55,50,34,0.04)] space-y-4">
        <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">edit_note</span>
          Giới thiệu bản thân
        </h3>
        <textarea
          className={inputClass + ' min-h-[120px] resize-none'}
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder="Viết vài dòng về bản thân, sở thích, thói quen để AI ghép bạn chính xác hơn..."
          maxLength={500}
        />
        <p className="text-xs text-on-surface-variant text-right">{form.bio.length}/500</p>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="flex-1 py-4 btn-gradient text-on-primary font-headline font-bold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">save</span>
          Lưu hồ sơ
        </button>
      </div>
    </form>
  );
}
