import { useState, useEffect, useCallback, type ReactNode } from 'react';
import TopNavBar from '../components/common/TopNavBar';
import SideNav from '../components/common/SideNav';
import type { SideNavProps } from '../components/common/SideNav';
import type { NavUser, NavAction } from '../components/common/TopNavBar';

export interface DashboardLayoutProps {
  children: ReactNode;
  sideNavProps: SideNavProps;
  user?: NavUser;
  extraNavActions?: NavAction[];
}

const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const DEFAULT_SIDEBAR_WIDTH = 280;

export default function DashboardLayout({
  children,
  sideNavProps,
  user,
  extraNavActions = [],
}: DashboardLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('totoro-sidebar-width');
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('totoro-sidebar-collapsed');
    return saved === 'true';
  });

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem('totoro-sidebar-width', sidebarWidth.toString());
    localStorage.setItem('totoro-sidebar-collapsed', isCollapsed.toString());
  }, [sidebarWidth, isCollapsed]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    // Automatically uncollapse if user starts dragging
    if (isCollapsed) setIsCollapsed(false);
  }, [isCollapsed]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;
      if (newWidth < SIDEBAR_MIN_WIDTH) newWidth = SIDEBAR_MIN_WIDTH;
      if (newWidth > SIDEBAR_MAX_WIDTH) newWidth = SIDEBAR_MAX_WIDTH;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const currentWidth = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth;
  const breakpoint = sideNavProps.breakpoint ?? 'lg';
  const marginClass = breakpoint === 'md' ? 'md:ml-[var(--sidebar-width)]' : 'lg:ml-[var(--sidebar-width)]';

  return (
    <div 
      className="min-h-screen bg-background text-on-background font-body flex flex-col"
      style={{ '--sidebar-width': `${currentWidth}px` } as React.CSSProperties}
    >
      <TopNavBar
        variant="dashboard"
        user={user}
        extraActions={extraNavActions}
      />

      <div className="flex flex-1">
        <SideNav 
          {...sideNavProps} 
          width={currentWidth}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onResizeStart={handleMouseDown}
          isDragging={isDragging}
        />

        <main 
          className={`flex-1 pt-20 pb-12 px-6 md:px-8 ${marginClass} transition-[margin] ease-out ${!isDragging ? 'duration-300' : 'duration-0'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
