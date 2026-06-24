import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef, MarkerDragEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '../../../providers/ThemeProvider';
import DashboardLayout from '../../../layouts/DashboardLayout';
import listingService from '../../../services/listingService';
import uploadService from '../../../services/uploadService';
import tagService from '../../../services/tagService';
import type { CreateListingRequest, TagDto } from '../../../types/listing';
import { useLandlordNav } from '../../../hooks/useLandlordNav';
import { useToast } from '../../../hooks/useToast';

// ── Step definitions ────────────────────────────────────────────────
const STEPS = [
  { label: 'Thông tin & Vị trí', icon: 'info' },
  { label: 'Chi phí', icon: 'payments' },
  { label: 'Tiện ích', icon: 'apartment' },
  { label: 'Hình ảnh', icon: 'photo_library' },
] as const;

type ListingType = 'room' | 'apartment' | 'house' | 'shared';
type AmenityKey = 'wifi' | 'aircon' | 'washer' | 'parking' | 'fridge' | 'water_heater' | 'security' | 'elevator' | 'balcony' | 'kitchen' | 'furniture' | 'pet_allowed';

interface FormData {
  // Step 1
  title: string;
  type: ListingType;
  area: number | '';
  address: string;
  district: string;
  description: string;
  latitude: number;
  longitude: number;
  // Step 2
  rentPrice: number | '';
  electricPrice: number | '';
  waterPrice: number | '';
  deposit: number | '';
  internetPrice: number | '';
  otherFees: string;
  // Step 3
  amenities: Set<AmenityKey>;
  tags: Set<string>;
  maxOccupants: number | '';
  floorNumber: number | '';
  totalFloors: number | '';
  // Step 4
  imageUrls: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

const HCM_CENTER = { lat: 10.762622, lng: 106.660172 };

const DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 12',
  'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Thủ Đức'
] as const;

const INITIAL: FormData = {
  title: '', type: 'room', area: '', address: '', district: '', description: '',
  latitude: HCM_CENTER.lat, longitude: HCM_CENTER.lng,
  rentPrice: '', electricPrice: '', waterPrice: '', deposit: '', internetPrice: '', otherFees: '',
  amenities: new Set(), tags: new Set(), maxOccupants: '', floorNumber: '', totalFloors: '',
  imageUrls: [],
};

const AMENITY_LIST: { key: AmenityKey; icon: string; label: string }[] = [
  { key: 'wifi', icon: 'wifi', label: 'Wi-Fi' },
  { key: 'aircon', icon: 'ac_unit', label: 'Máy lạnh' },
  { key: 'washer', icon: 'local_laundry_service', label: 'Máy giặt' },
  { key: 'parking', icon: 'two_wheeler', label: 'Chỗ đậu xe' },
  { key: 'fridge', icon: 'kitchen', label: 'Tủ lạnh' },
  { key: 'water_heater', icon: 'water_drop', label: 'Nóng lạnh' },
  { key: 'security', icon: 'security', label: 'Bảo vệ' },
  { key: 'elevator', icon: 'elevator', label: 'Thang máy' },
  { key: 'balcony', icon: 'balcony', label: 'Ban công' },
  { key: 'kitchen', icon: 'countertops', label: 'Nhà bếp' },
  { key: 'furniture', icon: 'chair', label: 'Nội thất' },
  { key: 'pet_allowed', icon: 'pets', label: 'Thú cưng' },
];

// ── Landlord nav config (dynamic from authStore) ────────────────────

// ── Helper: positive-number setter ──────────────────────────────────
const parsePositiveNumber = (val: string): number | '' => {
  if (!val) return '';
  const n = Number(val);
  return isNaN(n) || n < 0 ? '' : n;
};

// ───────────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const { landlordUser, sideNav } = useLandlordNav('listings');
  const toast = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [availableTags, setAvailableTags] = useState<TagDto[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    tagService.getAll().then(setAvailableTags).catch(console.error);
  }, []);

  // ── Field updater ──────────────────────────────────────────────
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const toggleAmenity = (key: AmenityKey) => {
    setForm((prev) => {
      const next = new Set(prev.amenities);
      if (next.has(key)) next.delete(key); else next.add(key);
      return { ...prev, amenities: next };
    });
  };

  const toggleTag = (slug: string) => {
    setForm((prev) => {
      const next = new Set(prev.tags);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return { ...prev, tags: next };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check total limit
    if (form.imageUrls.length + files.length > 10) {
      toast.warning('Chỉ được tải lên tối đa 10 ảnh.');
      return;
    }
    
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.warning(`Ảnh ${file.name} vượt quá 5MB.`);
          continue;
        }
        const url = await uploadService.uploadImage(file);
        urls.push(url);
      }
      update('imageUrls', [...form.imageUrls, ...urls]);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    update('imageUrls', form.imageUrls.filter((_, i) => i !== idx));
  };

  // ── Drag-to-reorder images ────────────────────────────────────
  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newUrls = [...form.imageUrls];
    const [moved] = newUrls.splice(dragIdx, 1);
    newUrls.splice(idx, 0, moved);
    setForm((prev) => ({ ...prev, imageUrls: newUrls }));
    setDragIdx(idx);
  };

  const handleDragEnd = () => setDragIdx(null);

  // ── Reverse Geocode handler ──────────────────────────────────
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!mapboxToken) return;
    try {
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&limit=1`);
      const data = await resp.json();
      const feature = data?.features?.[0];
      if (feature) {
        const placeName = feature.place_name || '';
        
        let detectedDistrict = '';
        const context = feature.context || [];
        for (const item of context) {
          if (item.id.startsWith('district') || item.id.startsWith('locality') || item.id.startsWith('place')) {
            const text = item.text;
            const matched = DISTRICTS.find(d => text.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(text.toLowerCase()));
            if (matched) {
              detectedDistrict = matched;
              break;
            }
          }
        }
        
        if (!detectedDistrict) {
          const matched = DISTRICTS.find(d => placeName.toLowerCase().includes(d.toLowerCase()));
          if (matched) {
            detectedDistrict = matched;
          }
        }

        setForm((prev) => {
          const next = { ...prev, address: placeName };
          if (detectedDistrict) {
            next.district = detectedDistrict;
          }
          return next;
        });
      }
    } catch { /* silent fail */ }
  }, [mapboxToken]);

  // ── Map drag handler ──────────────────────────────────────────
  const handleMarkerDrag = useCallback((e: MarkerDragEvent) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  // ── Geocode address → move map ────────────────────────────────
  const geocodeAddress = useCallback(async (addr: string) => {
    if (!mapboxToken || !addr.trim()) return;
    try {
      const q = encodeURIComponent(addr + ', Hồ Chí Minh');
      const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${mapboxToken}&limit=1&country=VN`);
      const data = await resp.json();
      const feature = data?.features?.[0];
      if (feature) {
        const [lng, lat] = feature.center;
        
        let detectedDistrict = '';
        const context = feature.context || [];
        for (const item of context) {
          if (item.id.startsWith('district') || item.id.startsWith('locality') || item.id.startsWith('place')) {
            const text = item.text;
            const matched = DISTRICTS.find(d => text.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(text.toLowerCase()));
            if (matched) {
              detectedDistrict = matched;
              break;
            }
          }
        }
        
        if (!detectedDistrict) {
          const name = feature.place_name || '';
          const matched = DISTRICTS.find(d => name.toLowerCase().includes(d.toLowerCase()));
          if (matched) {
            detectedDistrict = matched;
          }
        }

        setForm((prev) => {
          const next = { ...prev, latitude: lat, longitude: lng };
          if (detectedDistrict) {
            next.district = detectedDistrict;
          }
          return next;
        });
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1200 });
      }
    } catch { /* silent fail */ }
  }, [mapboxToken]);

  // ── Validation per step ───────────────────────────────────────
  const validateStep = (): boolean => {
    const errs: ValidationErrors = {};

    if (step === 0) {
      if (!form.title.trim()) errs.title = 'Vui lòng nhập tiêu đề tin đăng';
      if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ';
      if (!form.district) errs.district = 'Vui lòng chọn Quận/Huyện';
      if (form.area !== '' && Number(form.area) <= 0) errs.area = 'Diện tích phải lớn hơn 0';
    }

    if (step === 1) {
      if (form.rentPrice === '' || Number(form.rentPrice) <= 0) errs.rentPrice = 'Giá thuê phải lớn hơn 0';
      if (form.deposit !== '' && Number(form.deposit) < 0) errs.deposit = 'Tiền cọc không được âm';
      if (form.electricPrice !== '' && Number(form.electricPrice) < 0) errs.electricPrice = 'Tiền điện không được âm';
      if (form.waterPrice !== '' && Number(form.waterPrice) < 0) errs.waterPrice = 'Tiền nước không được âm';
      if (form.internetPrice !== '' && Number(form.internetPrice) < 0) errs.internetPrice = 'Tiền mạng không được âm';
    }

    if (step === 2) {
      if (form.maxOccupants !== '' && Number(form.maxOccupants) <= 0) errs.maxOccupants = 'Số người phải lớn hơn 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ──────────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return form.title.trim() !== '' && form.address.trim() !== '' && form.district !== '';
    if (step === 1) return form.rentPrice !== '' && Number(form.rentPrice) > 0;
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Final step — submit to API
      setIsSubmitting(true);
      setSubmitError(null);
      
      const amenityList = Array.from(form.amenities);
      
      const request: CreateListingRequest = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        district: form.district,
        city: 'Hồ Chí Minh',
        latitude: form.latitude,
        longitude: form.longitude,
        roomType: form.type,
        areaM2: form.area !== '' ? Number(form.area) : undefined,
        priceRent: Number(form.rentPrice),
        priceElectricity: form.electricPrice !== '' ? Number(form.electricPrice) : undefined,
        priceWater: form.waterPrice !== '' ? Number(form.waterPrice) : undefined,
        priceParking: undefined,
        isSharedOwner: form.type === 'shared',
        maxOccupants: form.maxOccupants !== '' ? Number(form.maxOccupants) : undefined,
        images: form.imageUrls.map((url, idx) => ({
          url,
          isCover: idx === 0,
          sortOrder: idx,
        })),
        facilities: amenityList.map(a => ({
          facilityType: 'amenity',
          name: a,
          isIncluded: true,
        })),
        tagSlugs: Array.from(form.tags),
      };

      try {
        await listingService.create(request);
        setSubmitted(true);
      } catch (err: unknown) {
        console.error('Failed to create listing:', err);
        setSubmitError('Đăng tin thất bại. Vui lòng kiểm tra lại thông tin và thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 0) setStep(step - 1);
    else navigate('/dashboard');
  };

  // ── Shared classes ─────────────────────────────────────────────
  const inputClass = 'w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all text-sm';
  const inputErrorClass = 'w-full bg-surface-container-low border border-error/50 rounded-lg p-4 focus:ring-2 focus:ring-error/20 text-on-surface placeholder:text-outline/50 transition-all text-sm';
  const labelClass = 'block text-sm font-bold text-on-surface-variant px-1 mb-2';
  const errorMsgClass = 'text-xs text-error mt-1 px-1 flex items-center gap-1';

  // ── Error field helper ─────────────────────────────────────────
  const fieldError = (key: string) =>
    errors[key] ? (
      <p className={errorMsgClass}>
        <span className="material-symbols-outlined text-xs">error</span>
        {errors[key]}
      </p>
    ) : null;

  // ── Success screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <DashboardLayout sideNavProps={sideNav} user={landlordUser}>
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-3">Đăng tin thành công!</h2>
          <p className="text-on-surface-variant mb-8">Tin đăng của bạn đã được gửi và đang chờ duyệt. Bạn sẽ nhận được thông báo khi tin đăng được phê duyệt.</p>
          <div className="flex gap-4">
            <button
              onClick={() => { setSubmitted(false); setStep(0); setForm(INITIAL); setErrors({}); }}
              className="px-6 py-3 border border-primary text-primary font-bold rounded-full hover:bg-primary-container/30 transition-colors"
            >
              Đăng tin khác
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Về bảng điều khiển
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sideNavProps={sideNav} user={landlordUser}>
      {/* Header */}
      <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-background mb-2">Đăng tin mới</h2>
      <p className="text-xs text-on-surface-variant mb-8 flex items-center gap-1">
        <span className="material-symbols-outlined text-sm text-error">info</span>
        Các trường có dấu <span className="text-error font-bold">*</span> là bắt buộc điền.
      </p>

      {/* ─── Stepper ────────────────────────────────────────── */}
      <div className="relative mb-12 max-w-5xl">
        {/* Background track — connects all circles */}
        <div className="absolute top-5 left-[calc(100%/8)] right-[calc(100%/8)] h-0.5 bg-surface-container-highest" />
        {/* Active progress track */}
        <div
          className="absolute top-5 left-[calc(100%/8)] h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(step / (STEPS.length - 1)) * (100 - 100 / 4)}%` }}
        />

        <div className="flex justify-between items-start relative z-10">
          {STEPS.map((s, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.label}
                onClick={() => i <= step && setStep(i)}
                className="flex flex-col items-center gap-2 group"
                disabled={i > step}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
                  isDone
                    ? 'bg-primary text-on-primary'
                    : isActive
                      ? 'bg-primary text-on-primary scale-110 ring-4 ring-primary/20'
                      : 'bg-surface-container-highest text-outline'
                }`}>
                  {isDone
                    ? <span className="material-symbols-outlined text-lg">check</span>
                    : i + 1
                  }
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                  isActive || isDone ? 'text-primary' : 'text-outline'
                }`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Form content ───────────────────────────────────── */}
      <div className="space-y-8 pb-24 max-w-5xl">

        {/* ═══ Step 1: Thông tin & Vị trí ═══ */}
        {step === 0 && (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/10 animate-[fadeIn_0.3s_ease]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 bg-primary h-6 rounded-full" />
              <h3 className="text-xl font-headline font-bold text-on-surface">1. Thông tin cơ bản & Vị trí</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className={labelClass}>Tên phòng / Tiêu đề tin đăng <span className="text-error">*</span></label>
                  <input className={errors.title ? inputErrorClass : inputClass} placeholder="Ví dụ: Phòng Studio cao cấp, Quận 1" value={form.title} onChange={(e) => update('title', e.target.value)} />
                  {fieldError('title')}
                </div>

                {/* Type + Area */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Loại hình <span className="text-error">*</span></label>
                    <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value as ListingType)}>
                      <option value="room">Phòng trọ</option>
                      <option value="apartment">Căn hộ mini</option>
                      <option value="house">Nhà nguyên căn</option>
                      <option value="shared">Ở ghép</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Diện tích (m²) <span className="text-error">*</span></label>
                    <input type="number" min="0" className={errors.area ? inputErrorClass : inputClass} placeholder="25" value={form.area} onChange={(e) => update('area', parsePositiveNumber(e.target.value))} />
                    {fieldError('area')}
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className={labelClass}>Quận / Huyện <span className="text-error">*</span></label>
                  <select className={errors.district ? inputErrorClass : inputClass} value={form.district} onChange={(e) => update('district', e.target.value)}>
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {fieldError('district')}
                </div>

                {/* Address */}
                <div>
                  <label className={labelClass}>Địa chỉ chi tiết <span className="text-error">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                    <input
                      className={(errors.address ? inputErrorClass : inputClass) + ' pl-12'}
                      placeholder="Số nhà, tên đường, phường..."
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      onBlur={() => geocodeAddress(form.address)}
                      onKeyDown={(e) => e.key === 'Enter' && geocodeAddress(form.address)}
                    />
                  </div>
                  <p className="text-[10px] text-outline mt-1 px-1">Nhấn Enter hoặc bỏ trỏ để tự động tìm vị trí trên bản đồ</p>
                  {fieldError('address')}
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Mô tả chi tiết</label>
                  <textarea className={inputClass + ' min-h-[120px] resize-none'} placeholder="Mô tả phòng, tiện ích xung quanh, giao thông..." value={form.description} onChange={(e) => update('description', e.target.value)} maxLength={2000} />
                  <p className="text-xs text-outline text-right mt-1">{form.description.length}/2000</p>
                </div>
              </div>

              {/* Interactive Mapbox map */}
              <div className="h-full min-h-[400px] rounded-lg overflow-hidden relative border border-outline-variant/20">
                {mapboxToken ? (
                  <Map
                    ref={mapRef}
                    initialViewState={{
                      longitude: form.longitude,
                      latitude: form.latitude,
                      zoom: 14,
                    }}
                    mapStyle={theme === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'}
                    mapboxAccessToken={mapboxToken}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <NavigationControl position="bottom-right" />
                    <Marker
                      longitude={form.longitude}
                      latitude={form.latitude}
                      anchor="bottom"
                      draggable
                      onDrag={handleMarkerDrag}
                      onDragEnd={handleMarkerDrag}
                    >
                      <span className="material-symbols-outlined text-primary text-5xl drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    </Marker>
                  </Map>
                ) : (
                  <div className="w-full h-full bg-surface-variant flex flex-col items-center justify-center text-outline p-8 text-center">
                    <span className="material-symbols-outlined text-5xl mb-4">map</span>
                    <h3 className="font-headline font-bold text-lg mb-2">Bản đồ chưa được cấu hình</h3>
                    <p className="text-sm">Cung cấp <code>VITE_MAPBOX_ACCESS_TOKEN</code> trong <code>.env</code></p>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-3 rounded-lg flex items-center gap-3 pointer-events-none">
                  <span className="material-symbols-outlined text-secondary">info</span>
                  <p className="text-[10px] font-bold text-on-surface uppercase tracking-tight">Kéo thả ghim để chọn vị trí chính xác</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 2: Chi phí ═══ */}
        {step === 1 && (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/10 animate-[fadeIn_0.3s_ease]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 bg-primary h-6 rounded-full" />
              <h3 className="text-xl font-headline font-bold text-on-surface">2. Chi tiết chi phí</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rent */}
              <div>
                <label className={labelClass}>Giá thuê hàng tháng (VNĐ) <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">payments</span>
                  <input type="number" min="0" className={(errors.rentPrice ? inputErrorClass : inputClass) + ' pl-12'} placeholder="3,000,000" value={form.rentPrice} onChange={(e) => update('rentPrice', parsePositiveNumber(e.target.value))} />
                </div>
                {fieldError('rentPrice')}
              </div>

              {/* Deposit */}
              <div>
                <label className={labelClass}>Tiền đặt cọc (VNĐ)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">account_balance</span>
                  <input type="number" min="0" className={(errors.deposit ? inputErrorClass : inputClass) + ' pl-12'} placeholder="3,000,000" value={form.deposit} onChange={(e) => update('deposit', parsePositiveNumber(e.target.value))} />
                </div>
                {fieldError('deposit')}
              </div>

              {/* Electric */}
              <div>
                <label className={labelClass}>Tiền điện (VNĐ/kWh)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">bolt</span>
                  <input type="number" min="0" className={(errors.electricPrice ? inputErrorClass : inputClass) + ' pl-12'} placeholder="3,500" value={form.electricPrice} onChange={(e) => update('electricPrice', parsePositiveNumber(e.target.value))} />
                </div>
                {fieldError('electricPrice')}
              </div>

              {/* Water */}
              <div>
                <label className={labelClass}>Tiền nước (VNĐ/m³)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">water_drop</span>
                  <input type="number" min="0" className={(errors.waterPrice ? inputErrorClass : inputClass) + ' pl-12'} placeholder="15,000" value={form.waterPrice} onChange={(e) => update('waterPrice', parsePositiveNumber(e.target.value))} />
                </div>
                {fieldError('waterPrice')}
              </div>

              {/* Internet */}
              <div>
                <label className={labelClass}>Tiền mạng Internet (VNĐ/tháng)</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">wifi</span>
                  <input type="number" min="0" className={(errors.internetPrice ? inputErrorClass : inputClass) + ' pl-12'} placeholder="100,000" value={form.internetPrice} onChange={(e) => update('internetPrice', parsePositiveNumber(e.target.value))} />
                </div>
                {fieldError('internetPrice')}
              </div>

              {/* Other fees */}
              <div>
                <label className={labelClass}>Phí khác</label>
                <input className={inputClass} placeholder="Ghi chú phí phát sinh..." value={form.otherFees} onChange={(e) => update('otherFees', e.target.value)} />
              </div>
            </div>

            {/* Price summary */}
            {form.rentPrice && Number(form.rentPrice) > 0 && (
              <div className="mt-8 p-5 bg-primary-container/30 rounded-xl border border-primary/10">
                <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">summarize</span>
                  Tóm tắt chi phí
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-outline text-xs">Giá thuê</p>
                    <p className="font-bold text-primary">{Number(form.rentPrice).toLocaleString('vi-VN')}đ/tháng</p>
                  </div>
                  {form.deposit && Number(form.deposit) > 0 && (
                    <div>
                      <p className="text-outline text-xs">Đặt cọc</p>
                      <p className="font-bold">{Number(form.deposit).toLocaleString('vi-VN')}đ</p>
                    </div>
                  )}
                  {form.electricPrice && Number(form.electricPrice) > 0 && (
                    <div>
                      <p className="text-outline text-xs">Điện</p>
                      <p className="font-bold">{Number(form.electricPrice).toLocaleString('vi-VN')}đ/kWh</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Step 3: Tiện ích ═══ */}
        {step === 2 && (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/10 animate-[fadeIn_0.3s_ease]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 bg-primary h-6 rounded-full" />
              <h3 className="text-xl font-headline font-bold text-on-surface">3. Tiện ích & Thông tin thêm</h3>
            </div>

            {/* Amenity toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {AMENITY_LIST.map(({ key, icon, label }) => {
                const selected = form.amenities.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-sm font-bold ${
                      selected
                        ? 'bg-primary-container border-primary text-on-primary-container shadow-md scale-[1.02]'
                        : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:bg-surface-container'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${selected ? 'text-primary' : 'text-outline'}`} style={selected ? { fontVariationSettings: "'FILL' 1" } : undefined}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tags toggles */}
            {availableTags.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4 mt-8">
                  <span className="material-symbols-outlined text-primary">label</span>
                  <h4 className="font-bold text-on-surface">Tags / Đặc điểm nổi bật</h4>
                </div>
                <div className="flex flex-wrap gap-3 mb-8">
                  {availableTags.map((tag) => {
                    const selected = form.tags.has(tag.slug);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.slug)}
                        className={`px-4 py-2 rounded-full border transition-all text-sm font-bold flex items-center gap-2 ${
                          selected
                            ? 'bg-primary border-primary text-on-primary shadow-md scale-[1.02]'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container'
                        }`}
                      >
                        {tag.icon && <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Extra fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Số người ở tối đa</label>
                <input type="number" min="1" className={errors.maxOccupants ? inputErrorClass : inputClass} placeholder="2" value={form.maxOccupants} onChange={(e) => update('maxOccupants', parsePositiveNumber(e.target.value))} />
                {fieldError('maxOccupants')}
              </div>
              <div>
                <label className={labelClass}>Tầng</label>
                <input type="number" min="0" className={inputClass} placeholder="3" value={form.floorNumber} onChange={(e) => update('floorNumber', parsePositiveNumber(e.target.value))} />
              </div>
              <div>
                <label className={labelClass}>Tổng số tầng</label>
                <input type="number" min="1" className={inputClass} placeholder="5" value={form.totalFloors} onChange={(e) => update('totalFloors', parsePositiveNumber(e.target.value))} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ Step 4: Hình ảnh ═══ */}
        {step === 3 && (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/10 animate-[fadeIn_0.3s_ease]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 bg-primary h-6 rounded-full" />
              <h3 className="text-xl font-headline font-bold text-on-surface">4. Hình ảnh phòng</h3>
            </div>

            {/* Upload area */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
              multiple 
              accept="image/jpeg, image/png, image/webp" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={form.imageUrls.length >= 10 || isUploading}
              className="w-full border-2 border-dashed border-outline-variant/40 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary-container/10 transition-all group mb-6 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container transition-colors">
                {isUploading ? (
                  <span className="material-symbols-outlined text-3xl text-primary animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors">cloud_upload</span>
                )}
              </div>
              <p className="font-bold text-on-surface-variant text-sm">
                {isUploading ? 'Đang tải ảnh lên...' : 'Kéo thả hoặc bấm để tải ảnh lên'}
              </p>
              <p className="text-xs text-outline">JPG, PNG, WEBP — tối đa 10 ảnh, mỗi ảnh 5MB ({form.imageUrls.length}/10)</p>
            </button>

            {/* Image grid — drag to reorder */}
            {form.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {form.imageUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden group border transition-all cursor-grab active:cursor-grabbing ${
                      dragIdx === idx ? 'border-primary scale-95 opacity-60' : 'border-outline-variant/10'
                    }`}
                  >
                    <img src={url} alt={`Ảnh phòng ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">Ảnh bìa</span>
                    )}
                    {/* Order indicator */}
                    <span className="absolute bottom-2 left-2 bg-on-surface/60 text-surface text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{idx + 1}</span>
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-error/80 text-on-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                    {/* Drag handle */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity">
                      <span className="material-symbols-outlined text-surface text-sm drop-shadow">drag_indicator</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-outline mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Ảnh đầu tiên sẽ là ảnh bìa. Kéo ảnh để sắp xếp lại thứ tự.
            </p>
          </div>
        )}

        {/* ─── Bottom Actions ─────────────────────────────────── */}
        <div className="flex items-center justify-between pt-8 border-t border-outline-variant/20">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-on-surface font-bold hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {step === 0 ? 'Hủy bỏ' : 'Quay lại'}
          </button>

          <div className="flex gap-4 items-center">
            <button className="px-8 py-3 rounded-full border border-primary text-primary font-bold hover:bg-primary-container/30 transition-colors">
              Lưu nháp
            </button>

            {/* Next button with tooltip for next step */}
            <div className="relative">
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                onMouseEnter={() => step < STEPS.length - 1 && setShowNextTooltip(true)}
                onMouseLeave={() => setShowNextTooltip(false)}
                className={`px-10 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${
                  canProceed() && !isSubmitting
                    ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary hover:scale-[1.02] active:scale-95'
                    : 'bg-surface-container-highest text-outline cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    {step === STEPS.length - 1 ? 'Đăng tin' : 'Tiếp tục'}
                    <span className="material-symbols-outlined text-lg">{step === STEPS.length - 1 ? 'publish' : 'arrow_forward'}</span>
                  </>
                )}
              </button>

              {/* Tooltip showing next step preview */}
              {showNextTooltip && step < STEPS.length - 1 && (
                <div className="absolute bottom-full mb-3 right-0 bg-on-surface text-surface text-xs font-bold px-4 py-2.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-[fadeIn_0.15s_ease] z-50">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">{STEPS[step + 1].icon}</span>
                  Bước tiếp: {STEPS[step + 1].label}
                  <div className="absolute -bottom-1 right-8 w-2 h-2 bg-on-surface rotate-45" />
                </div>
              )}
            </div>
          </div>

          {/* Submission error */}
          {submitError && (
            <div className="mt-4 p-4 bg-error-container rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-sm font-bold text-on-error-container">{submitError}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
