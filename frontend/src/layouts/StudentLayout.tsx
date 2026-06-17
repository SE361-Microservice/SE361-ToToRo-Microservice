import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import TopNavBar from '../components/common/TopNavBar';
import Footer from '../components/common/Footer';
import BottomNav from '../components/common/BottomNav';
import FAB from '../components/common/FAB';
import type { NavUser } from '../components/common/TopNavBar';
import { footerBrand, footerColumns, footerCopyright } from './shared/footerData';

const studentLinksDef = [
  { label: 'Trang chủ', href: '/home' },
  { label: 'Tìm phòng', href: '/search' },
  { label: 'Matchmates', href: '/matching' },
  { label: 'Cộng đồng', href: '/community' },
  { label: 'Tin nhắn', href: '/messages' },
];

const studentNavItems = [
  { icon: 'home', label: 'Trang chủ', href: '/home' },
  { icon: 'search', label: 'Tìm phòng', href: '/search' },
  { icon: 'group_add', label: 'Match', href: '/matching' },
  { icon: 'forum', label: 'Tin nhắn', href: '/messages' },
  { icon: 'account_circle', label: 'Tài khoản', href: '/profile' },
];

interface StudentLayoutProps {
  children: ReactNode;
  user?: NavUser;
}

export default function StudentLayout({ children, user }: StudentLayoutProps) {
  const { pathname } = useLocation();
  const studentLinks = studentLinksDef.map((link) => ({
    ...link,
    active: pathname === link.href || pathname.startsWith(link.href + '/'),
  }));

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <TopNavBar
        variant="student"
        navLinks={studentLinks}
        user={user}
        extraActions={[
          {
            icon: 'bookmark',
            label: 'Nhà trọ đã lưu',
            onClick: () => window.location.assign('/saved')
          }
        ]}
      />

      <main className="pt-24 pb-28 md:pb-12">
        {children}
      </main>

      <Footer
        brand={footerBrand}
        columns={footerColumns}
        copyright={footerCopyright}
      />

      {/* Mobile pill nav with center swipe FAB */}
      <BottomNav
        items={studentNavItems}
        centerFAB={{ icon: 'swipe', onClick: () => {} }}
        shape="pill"
      />

      {/* AI assistant FAB */}
      <FAB icon="assistant" tooltip="AI Concierge" />
    </div>
  );
}
