import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export type UserRole = 'STUDENT' | 'LANDLORD';

interface RoleOption {
  value: UserRole;
  icon: string;
  labelKey: string;
  iconColor?: string;
}

interface RoleSelectorProps {
  selected: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
}

const roles: RoleOption[] = [
  { value: 'STUDENT', icon: 'school', labelKey: 'register.roleStudent', iconColor: 'text-primary' },
  { value: 'LANDLORD', icon: 'domain', labelKey: 'register.roleLandlord', iconColor: 'text-secondary' },
];

export default function RoleSelector({ selected, onChange, className }: RoleSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className={clsx('space-y-4', className)}>
      <label className="block font-label text-sm font-bold uppercase tracking-widest text-on-surface-variant">
        {t('register.roleLabel')}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => {
          const isActive = selected === role.value;
          return (
            <label key={role.value} className="relative cursor-pointer group">
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={isActive}
                onChange={() => onChange(role.value)}
                className="peer sr-only"
              />
              <div
                className={clsx(
                  'p-4 rounded-lg border transition-all duration-200 text-center flex flex-col items-center gap-2',
                  isActive
                    ? 'bg-primary-container border-primary'
                    : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container',
                )}
              >
                <span className={clsx('material-symbols-outlined text-3xl', role.iconColor)}>
                  {role.icon}
                </span>
                <span className="font-semibold text-sm">{t(role.labelKey)}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
