import clsx from 'clsx';
import Tag from '../ui/Tag';

export interface ProfileCardProps {
  name: string;
  age: number;
  institution: string;
  lifestyleTags: string[];
  image: string;
  rotated?: boolean;
  showSwipeUI?: boolean;
  className?: string;
}

export default function ProfileCard({
  name,
  age,
  institution,
  lifestyleTags,
  image,
  rotated,
  showSwipeUI,
  className,
}: ProfileCardProps) {
  return (
    <article
      className={clsx(
        'bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient',
        'flex flex-col transition-transform duration-300 hover:scale-[1.02]',
        rotated && 'rotate-3',
        showSwipeUI && 'group',
        className,
      )}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showSwipeUI && (
          <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center shadow-ambient">
              <span className="material-symbols-outlined text-on-error-container">close</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-ambient">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-5">
        <div>
          <h3 className="font-headline font-bold text-on-background">
            {name}, <span className="font-normal">{age}</span>
          </h3>
          <p className="text-xs text-on-surface-variant font-body">{institution}</p>
        </div>

        {lifestyleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lifestyleTags.map((tag) => (
              <Tag key={tag} label={tag} variant="lifestyle" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
