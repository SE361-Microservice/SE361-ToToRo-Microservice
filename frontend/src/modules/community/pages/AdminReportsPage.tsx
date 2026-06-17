import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { SideNavProps } from '../../../components/common/SideNav';
import useAuthStore from '../../../store/authStore';
import adminService from '../../../services/adminService';
import type { ReportResponse } from '../../../types/report';
import Modal from '../../../components/core/Modal';
import { useToast } from '../../../hooks/useToast';

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã xử lý',
  DISMISSED: 'Đã bỏ qua',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-secondary-container text-on-secondary-container',
  RESOLVED: 'bg-primary-container text-on-primary-container',
  DISMISSED: 'bg-surface-container-highest text-on-surface-variant',
};

const targetLabels: Record<string, string> = {
  LISTING: 'Tin đăng',
  USER: 'Người dùng',
  COMMUNITY_POST: 'Bài viết',
  REVIEW: 'Đánh giá',
};

export default function AdminReportsPage() {
  const toast = useToast();
  const { user: authUser, isAuthenticated } = useAuthStore();

  const adminUser = useMemo(() => ({
    name: (isAuthenticated && authUser) ? (authUser.fullName || authUser.email) : 'Admin',
    role: 'Quản trị viên',
    avatar: (isAuthenticated && authUser) ? (authUser.avatarUrl || '') : '',
  }), [authUser, isAuthenticated]);

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve modal
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPendingReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleResolve = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!selectedReport) return;
    setIsResolving(true);
    try {
      await adminService.resolveReport(selectedReport.id, {
        status,
        note: resolveNote || undefined,
      });
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setSelectedReport(null);
      setResolveNote('');
    } catch (err) {
      console.error('Failed to resolve report:', err);
      toast.error('Có lỗi xảy ra khi xử lý báo cáo.');
    } finally {
      setIsResolving(false);
    }
  };

  const adminSideNav: SideNavProps = useMemo(() => ({
    header: { title: 'ToToRo Admin' },
    items: [
      { icon: 'dashboard', label: 'Tổng quan', href: '/admin', active: false },
      { icon: 'group', label: 'Quản lý người dùng', href: '/admin/users', active: false },
      { icon: 'home_work', label: 'Quản lý tin đăng', href: '/admin/listings', active: false },
      { icon: 'flag', label: 'Báo cáo vi phạm', href: '/admin/reports', active: true },
      { icon: 'label', label: 'Quản lý Tag', href: '/admin/tags', active: false },
      { icon: 'analytics', label: 'Thống kê', href: '/admin/analytics', active: false },
    ],
    breakpoint: 'lg',
  }), []);

  return (
    <DashboardLayout sideNavProps={adminSideNav} user={adminUser}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-1">
            Báo cáo vi phạm
          </h1>
          <p className="text-on-surface-variant font-body">
            {reports.length} báo cáo đang chờ xử lý
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-6 py-4 text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant/60">
          <div className="col-span-3">Người báo cáo</div>
          <div className="col-span-2">Loại mục tiêu</div>
          <div className="col-span-3">Lý do</div>
          <div className="col-span-2">Ngày tạo</div>
          <div className="col-span-2 text-right">Hành động</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface-container rounded-full">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-on-surface-variant">Đang tải...</span>
            </div>
          </div>
        )}

        {/* Rows */}
        {!isLoading && reports.map((report) => (
          <div
            key={report.id}
            className="bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_rgba(55,50,34,0.06)] p-4 md:p-6 transition-transform hover:-translate-y-0.5 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6">
              {/* Reporter */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-error text-[20px]">flag</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{report.reporterEmail}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[report.status]}`}>
                    {statusLabels[report.status]}
                  </span>
                </div>
              </div>

              {/* Target Type */}
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">
                    {report.targetType === 'LISTING' ? 'home_work' :
                     report.targetType === 'USER' ? 'person' :
                     report.targetType === 'REVIEW' ? 'star' : 'article'}
                  </span>
                  {targetLabels[report.targetType]} #{report.targetId}
                </span>
              </div>

              {/* Reason */}
              <div className="col-span-3">
                <p className="text-sm text-on-surface font-medium line-clamp-2">{report.reason}</p>
                {report.description && (
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{report.description}</p>
                )}
              </div>

              {/* Date */}
              <div className="col-span-2">
                <p className="text-xs font-medium text-on-surface-variant">
                  {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-xs text-outline mt-0.5">
                  {new Date(report.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end items-center gap-2">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  Xử lý
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty */}
        {!isLoading && reports.length === 0 && (
          <div className="py-16 text-center bg-surface-container-lowest rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">verified</span>
            </div>
            <p className="font-headline font-bold text-lg text-on-surface">Không có báo cáo nào</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Tuyệt vời! Hệ thống hiện không có báo cáo vi phạm nào cần xử lý.
            </p>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => { setSelectedReport(null); setResolveNote(''); }}
        title="Xử lý báo cáo vi phạm"
      >
        <div className="p-6">
          {selectedReport && (
            <>
              <div className="p-4 bg-surface-container rounded-2xl mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Người báo cáo</span>
                  <span className="text-sm font-bold text-on-surface">{selectedReport.reporterEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Mục tiêu</span>
                  <span className="text-sm font-bold text-on-surface">{targetLabels[selectedReport.targetType]} #{selectedReport.targetId}</span>
                </div>
                <div className="border-t border-outline-variant/20 pt-3">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Lý do</span>
                  <p className="text-sm text-on-surface">{selectedReport.reason}</p>
                </div>
                {selectedReport.description && (
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Mô tả chi tiết</span>
                    <p className="text-sm text-on-surface-variant">{selectedReport.description}</p>
                  </div>
                )}
              </div>

              <label className="text-sm font-bold text-on-surface block mb-2">Ghi chú xử lý (tùy chọn)</label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                className="w-full border border-outline-variant/30 rounded-xl px-4 py-3 text-sm bg-surface-container-lowest text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Nhập ghi chú xử lý..."
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => handleResolve('DISMISSED')}
                  disabled={isResolving}
                  className="px-5 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={() => handleResolve('RESOLVED')}
                  disabled={isResolving}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isResolving && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                  Xử lý vi phạm
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
