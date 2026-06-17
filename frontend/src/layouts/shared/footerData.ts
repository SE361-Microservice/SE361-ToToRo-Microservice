import type { FooterProps } from '../../components/common/Footer';

export const footerBrand: FooterProps['brand'] = {
  name: 'Totoro',
  tagline: 'Nền tảng tìm trọ & kết bạn đồng hành dành cho sinh viên',
  description: '© 2024 Totoro Platform. The Digital Hearth.',
};

export const footerColumns: FooterProps['columns'] = [
  {
    heading: 'Tìm phòng',
    links: [
      { label: 'Phòng trọ', href: '/search' },
      { label: 'Ký túc xá', href: '/dorms' },
      { label: 'Chung cư mini', href: '/apartments' },
    ],
  },
  {
    heading: 'Cộng đồng',
    links: [
      { label: 'Matchmates', href: '/matching' },
      { label: 'Đánh giá', href: '/reviews' },
      { label: 'Diễn đàn', href: '/forum' },
    ],
  },
  {
    heading: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm trợ giúp', href: '/help' },
      { label: 'Điều khoản dịch vụ', href: '/terms' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
    ],
  },
];

export const footerCopyright = '© 2024 Totoro Platform. All rights reserved.';
