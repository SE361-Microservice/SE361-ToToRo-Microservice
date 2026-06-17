import clsx from 'clsx';

export interface CollectionCardProps {
  image: string;
  title: string;
  count: number;
  onClick?: () => void;
  className?: string;
}

export default function CollectionCard({ image, title, count, onClick, className }: CollectionCardProps) {
  return (
    <article
      onClick={onClick}
      className={clsx(
        'group relative w-64 h-80 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer',
        'shadow-ambient transition-transform duration-300 hover:scale-[1.02]',
        className,
      )}
    >
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent" />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-xs text-inverse-on-surface font-label uppercase tracking-widest mb-1">{count} phòng trọ</p>
        <h3 className="font-headline font-bold text-on-primary text-lg leading-tight">{title}</h3>
      </div>
    </article>
  );
}
