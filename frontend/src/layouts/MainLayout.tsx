import type { ReactNode } from 'react';
import TopNavBar from '../components/common/TopNavBar';
import Footer from '../components/common/Footer';
import BottomNav from '../components/common/BottomNav';
import { footerBrand, footerColumns, footerCopyright } from './shared/footerData';

const guestNavItems = [
  { icon: 'home', label: 'Trang chủ', href: '/' },
  { icon: 'search', label: 'Tìm phòng', href: '/search' },
  { icon: 'group_add', label: 'Matchmates', href: '/matching' },
  { icon: 'person', label: 'Hồ sơ', href: '/profile' },
];

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <TopNavBar variant="guest" />

      <main className="pt-20 pb-20 md:pb-0">
        {children}
      </main>

      <Footer
        brand={footerBrand}
        columns={footerColumns}
        copyright={footerCopyright}
      />

      <BottomNav items={guestNavItems} shape="bar" />
    </div>
  );
}
