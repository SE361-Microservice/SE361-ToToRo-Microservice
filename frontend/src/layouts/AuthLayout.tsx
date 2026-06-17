import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TotoroLogo from '../components/ui/TotoroLogo';
import LangSwitcher from '../components/common/LangSwitcher';
import ThemeToggle from '../components/common/ThemeToggle';
import {
  AUTH_HERO_LOGIN,
  AUTH_HERO_REGISTER,
  AUTH_TESTIMONIAL_AVATAR,
  AUTH_SOCIAL_AVATARS,
  AUTH_LEGAL_LINKS,
} from './shared/authVisualData';

export type AuthVariant = 'split' | 'standard';

interface AuthLayoutProps {
  variant: AuthVariant;
  children: ReactNode;
}

/* ── Login: Split Layout ───────────────────────────────────── */
function SplitLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Editorial Brand Visual */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container relative overflow-hidden items-center justify-center p-16">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #406934 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 max-w-xl">
          <div className="mb-12">
            <TotoroLogo size="md" />
          </div>
          <h1 className="font-headline text-5xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-[-0.03em]">
            {t('authLayout.split.headline1')} <br />
            <span className="text-primary italic">{t('authLayout.split.headline2')}</span> <br />
            {t('authLayout.split.headline3')}
          </h1>
          <p className="text-on-surface-variant text-xl max-w-md leading-relaxed mb-10">
            {t('authLayout.split.subtitle')}
          </p>
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-xl ghost-border">
            <img
              src={AUTH_HERO_LOGIN}
              alt="Modern cozy student apartment interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={AUTH_TESTIMONIAL_AVATAR} alt="Minh Anh" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm">{t('authLayout.split.testimonial')}</p>
                <p className="text-xs text-on-surface-variant">{t('authLayout.split.testimonialAuthor')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 bg-surface">
        {/* Mobile logo */}
        <div className="md:hidden mb-10">
          <TotoroLogo size="sm" />
        </div>
        <div className="max-w-md w-full mx-auto">
          {children}
        </div>
        {/* Bottom legal */}
        <div className="mt-auto pt-10 flex flex-wrap justify-center gap-6 text-[10px] font-label text-outline uppercase tracking-wider">
          {AUTH_LEGAL_LINKS.map((l) => (
            <Link key={l.label} to={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
          ))}
          <div className="flex items-center gap-3 ml-auto md:ml-4">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Register/Others: Standard Layout ──────────────────────── */
function StandardLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-surface">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link to="/">
            <TotoroLogo size="sm" showText />
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <ThemeToggle />
            <span className="material-symbols-outlined text-primary hover:opacity-80 cursor-pointer hidden md:flex">help_outline</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Branding Visual */}
        <div className="hidden lg:block lg:col-span-6 space-y-8">
          <h1 className="font-headline font-extrabold text-5xl xl:text-6xl text-on-surface leading-tight tracking-tighter">
            {t('authLayout.standard.headline1')}<br />
            <span className="text-primary italic">{t('authLayout.standard.headline2')}</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-md">
            {t('authLayout.standard.subtitle')}
          </p>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
            <img
              src={AUTH_HERO_REGISTER}
              alt="Warm cozy apartment interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 glass-panel p-6 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {AUTH_SOCIAL_AVATARS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`User ${i + 1}`}
                      className="w-10 h-10 rounded-full border-2 border-surface object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold text-on-surface">
                  {t('authLayout.standard.socialProof')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form Card */}
        <div className="lg:col-span-6 w-full max-w-xl mx-auto">
          <div className="bg-surface-container-lowest p-8 lg:p-12 rounded-xl border border-outline-variant/10 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Main Export ────────────────────────────────────────────── */
export default function AuthLayout({ variant, children }: AuthLayoutProps) {
  return variant === 'split'
    ? <SplitLayout>{children}</SplitLayout>
    : <StandardLayout>{children}</StandardLayout>;
}
