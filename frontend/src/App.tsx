import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n'; // i18n initialisation – must be imported before any component
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import useAuthStore from './store/authStore';

// ── Listing module ────────────────────────────────────────
import GuestHomePage     from './modules/listing/pages/GuestHomePage';
import StudentHomePage   from './modules/listing/pages/StudentHomePage';
import LandlordDashboard from './modules/listing/pages/LandlordDashboard';
import ListingSearchPage from './modules/listing/pages/ListingSearchPage';
import ListingDetailPage from './modules/listing/pages/ListingDetailPage';
import NewListingPage    from './modules/listing/pages/NewListingPage';
import EditListingPage   from './modules/listing/pages/EditListingPage';
import SavedListingsPage from './modules/listing/pages/SavedListingsPage';
import MyListingsPage    from './modules/listing/pages/MyListingsPage';
import LandlordAnalyticsPage from './modules/listing/pages/LandlordAnalyticsPage';

// ── Community module ──────────────────────────────────────
import AdminDashboard    from './modules/community/pages/AdminDashboard';
import AdminUsersPage    from './modules/community/pages/AdminUsersPage';
import AdminListingsPage from './modules/community/pages/AdminListingsPage';
import AdminReportsPage  from './modules/community/pages/AdminReportsPage';
import AdminTagsPage     from './modules/community/pages/AdminTagsPage';
import AdminAnalyticsPage from './modules/community/pages/AdminAnalyticsPage';
import CommunityPage     from './modules/community/pages/CommunityPage';

// ── Matching module ───────────────────────────────────────
import MatchingSwipePage from './modules/matching/pages/MatchingSwipePage';
import MatchListPage     from './modules/matching/pages/MatchListPage';

// ── Chat module ───────────────────────────────────────────
import ChatPage          from './modules/chat/pages/ChatPage';

// ── Notification module ───────────────────────────────────
import NotificationsPage from './modules/notification/pages/NotificationsPage';

// ── Auth module ───────────────────────────────────────────
import LoginPage         from './modules/auth/pages/LoginPage';
import RegisterPage      from './modules/auth/pages/RegisterPage';
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import VerifyEmailPage   from './modules/auth/pages/VerifyEmailPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';
import OAuthRedirectPage from './modules/auth/pages/OAuthRedirectPage';

// ── User module ───────────────────────────────────────────
import ProfilePage       from './modules/user/pages/ProfilePage';

// ── Common ────────────────────────────────────────────────
import NotFoundPage      from './modules/common/pages/NotFoundPage';

// ── AI module ─────────────────────────────────────────────
import AiChatWidget      from './modules/ai/AiChatWidget';
import ToastContainer    from './components/common/ToastContainer';
import ConfirmDialog     from './components/core/ConfirmDialog';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  useEffect(() => {
    hydrate();
    // After hydrating tokens from localStorage, fetch user profile
    // (the store's fetchCurrentUser checks isAuthenticated internally)
  }, [hydrate]);

  // Fetch user profile once tokens are hydrated
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AiChatWidget />
      <ToastContainer />
      <ConfirmDialog />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<GuestHomePage />} />
        <Route path="/search"          element={<ListingSearchPage />} />
        <Route path="/listings/:id"    element={<ListingDetailPage />} />
        <Route path="/community"       element={<CommunityPage />} />

        {/* Auth (public — guest-only pages) */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email"    element={<VerifyEmailPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/oauth2/redirect" element={<OAuthRedirectPage />} />

        {/* Authenticated — requires login (shared/common routes) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notifications"   element={<NotificationsPage />} />
          <Route path="/profile"         element={<ProfilePage />} />
        </Route>

        {/* Student-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/home"            element={<StudentHomePage />} />
          <Route path="/saved"           element={<SavedListingsPage />} />
          <Route path="/matching"        element={<MatchingSwipePage />} />
          <Route path="/matching/matches" element={<MatchListPage />} />
          <Route path="/messages"        element={<ChatPage variant="student" />} />
          <Route path="/messages/:conversationId" element={<ChatPage variant="student" />} />
        </Route>

        {/* Landlord-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['LANDLORD']} />}>
          <Route path="/dashboard"       element={<LandlordDashboard />} />
          <Route path="/dashboard/listings"       element={<MyListingsPage />} />
          <Route path="/dashboard/listings/new"   element={<NewListingPage />} />
          <Route path="/dashboard/listings/:id/edit" element={<EditListingPage />} />
          <Route path="/dashboard/messages"        element={<ChatPage variant="landlord" />} />
          <Route path="/dashboard/messages/:conversationId" element={<ChatPage variant="landlord" />} />
          <Route path="/dashboard/analytics"  element={<LandlordAnalyticsPage />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin"           element={<AdminDashboard />} />
          <Route path="/admin/users"     element={<AdminUsersPage />} />
          <Route path="/admin/listings"  element={<AdminListingsPage />} />
          <Route path="/admin/reports"   element={<AdminReportsPage />} />
          <Route path="/admin/tags"      element={<AdminTagsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*"                element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
