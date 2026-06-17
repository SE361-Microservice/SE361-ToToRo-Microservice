import type { MatchFilter } from '../../../types/matching';
import { mockUniversities, mockDistricts } from '../../../mockData/matchingProfiles';

interface BrowseFilterProps {
  filters: MatchFilter;
  onChange: (filters: MatchFilter) => void;
}

export default function BrowseFilter({ filters, onChange }: BrowseFilterProps) {
  const update = (patch: Partial<MatchFilter>) => onChange({ ...filters, ...patch });

  const selectClass =
    'px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-sm font-body text-on-surface focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer';

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 shadow-[0_4px_16px_rgba(55,50,34,0.04)]">
      <div className="flex flex-wrap items-center gap-3">
        {/* University */}
        <select
          value={filters.university}
          onChange={(e) => update({ university: e.target.value })}
          className={selectClass}
        >
          <option value="">Tất cả trường</option>
          {mockUniversities.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        {/* District */}
        <select
          className={selectClass}
        >
          <option value="">Tất cả quận</option>
          {mockDistricts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Gender */}
        <select
          value={filters.gender ?? ''}
          onChange={(e) => update({ gender: e.target.value as MatchFilter['gender'] })}
          className={selectClass}
        >
          <option value="">Giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>

        {/* Budget range (simple text for now) */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min (triệu)"
            value={filters.budgetMin || ''}
            onChange={(e) => update({ budgetMin: Number(e.target.value) * 1000000 || 0 })}
            className="w-24 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-sm focus:ring-2 focus:ring-primary"
          />
          <span className="text-on-surface-variant text-sm">–</span>
          <input
            type="number"
            placeholder="Max (triệu)"
            value={filters.budgetMax ? filters.budgetMax / 1000000 : ''}
            onChange={(e) => update({ budgetMax: Number(e.target.value) * 1000000 || 0 })}
            className="w-24 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-sm focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Reset */}
        <button
          className="ml-auto px-3 py-2 text-xs font-bold text-primary hover:bg-primary-container/30 rounded-lg transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
