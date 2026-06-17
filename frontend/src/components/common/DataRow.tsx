import clsx from 'clsx';
import Avatar from '../ui/Avatar';
import StatusDot from '../ui/StatusDot';

export type DataRowVariant = 'inquiry' | 'listing';

export interface DataRowColumn {
  label: string;
  value: string;
}

export interface DataRowProps {
  variant: DataRowVariant;
  // Media
  avatar?: string;
  thumbnail?: string;
  name: string;
  subtext: string;
  status?: string;
  statusColor?: 'primary' | 'secondary' | 'outline';
  time?: string;
  columns?: DataRowColumn[];
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const statusColorMap: Record<string, 'primary' | 'secondary' | 'error'> = {
  primary:   'primary',
  secondary: 'secondary',
  outline:   'primary',
};

export default function DataRow({
  variant,
  avatar,
  thumbnail,
  name,
  subtext,
  status,
  statusColor = 'primary',
  time,
  columns = [],
  actions,
  onClick,
  className,
}: DataRowProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'group flex items-center gap-4 p-4 rounded-lg',
        'bg-surface-container-lowest hover:bg-surface-container',
        'ghost-border border-transparent hover:border-primary/10',
        'transition-colors duration-200 cursor-pointer',
        className,
      )}
    >
      {/* Media */}
      {variant === 'inquiry' && avatar && (
        <Avatar src={avatar} alt={name} size="md" />
      )}
      {variant === 'listing' && thumbnail && (
        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Primary info */}
      <div className="flex-1 min-w-0 grid gap-4"
        style={{ gridTemplateColumns: `1fr 1fr${columns.map(() => ' 1fr').join('')} auto` }}
      >
        {/* Name + subtext */}
        <div className="col-span-1">
          <p className="text-xs text-outline font-label uppercase tracking-tighter mb-0.5">
            {variant === 'inquiry' ? 'Người gửi' : 'Chủ đăng'}
          </p>
          <p className="font-bold text-sm text-on-background truncate">{name}</p>
          {variant === 'inquiry' && (
            <p className="text-xs text-on-surface-variant truncate">{subtext}</p>
          )}
        </div>

        {/* Subtext column (listing type) */}
        {variant === 'listing' && (
          <div className="col-span-1">
            <p className="text-xs text-outline font-label uppercase tracking-tighter mb-0.5">Loại</p>
            <p className="font-bold text-sm">{subtext}</p>
          </div>
        )}

        {/* Extra columns */}
        {columns.map((col) => (
          <div key={col.label} className="col-span-1">
            <p className="text-xs text-outline font-label uppercase tracking-tighter mb-0.5">{col.label}</p>
            <p className="font-bold text-sm">{col.value}</p>
          </div>
        ))}

        {/* Status */}
        {status && (
          <div className="col-span-1">
            <p className="text-xs text-outline font-label uppercase tracking-tighter mb-0.5">Trạng thái</p>
            <span className={clsx(
              'inline-flex items-center gap-1.5 text-xs font-bold',
              statusColor === 'secondary' ? 'text-secondary' : 'text-primary',
            )}>
              <StatusDot
                color={statusColorMap[statusColor]}
                size="xs"
              />
              {status}
            </span>
          </div>
        )}

        {/* Time */}
        {time && (
          <div className="col-span-1">
            <p className="text-xs text-outline font-label uppercase tracking-tighter mb-0.5">Thời gian</p>
            <p className="text-xs text-on-surface-variant">{time}</p>
          </div>
        )}
      </div>

      {/* Actions slot */}
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
