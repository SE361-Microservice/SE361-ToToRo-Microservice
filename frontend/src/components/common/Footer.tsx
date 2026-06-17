import clsx from 'clsx';
import { Link } from 'react-router-dom';
import IconButton from '../ui/IconButton';

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface FooterProps {
  brand: {
    name: string;
    tagline: string;
    description?: string;
  };
  columns: FooterColumn[];
  socialLinks?: { icon: string; href: string; label: string }[];
  copyright?: string;
  className?: string;
}

export default function Footer({
  brand,
  columns,
  socialLinks = [],
  copyright,
  className,
}: FooterProps) {
  return (
    <footer className={clsx('bg-surface-container', className)}>
      <div className="max-w-screen-xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <span className="text-lg font-headline font-bold text-on-background">{brand.name}</span>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed uppercase tracking-widest">
            {brand.tagline}
          </p>
          {brand.description && (
            <p className="font-body text-xs text-on-surface-variant/70 leading-relaxed">
              {brand.description}
            </p>
          )}
          {socialLinks.length > 0 && (
            <div className="flex gap-2 mt-2">
              {socialLinks.map((s) => (
                <IconButton
                  key={s.icon}
                  icon={s.icon}
                  label={s.label}
                  onClick={() => window.open(s.href, '_blank')}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="font-headline font-bold text-sm mb-4 text-primary uppercase tracking-wider">
              {col.heading}
            </h4>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright bar */}
      {copyright && (
        <div className="border-t border-outline-variant/20 px-6 py-4">
          <p className="text-center text-xs font-body text-on-surface-variant/60">{copyright}</p>
        </div>
      )}
    </footer>
  );
}
