import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import CompleteProfileModal from '../components/CompleteProfileModal';

/**
 * OAuth2 redirect landing page.
 *
 * After Google login, the backend's OAuth2AuthenticationSuccessHandler
 * redirects here with:  /oauth2/redirect?token=<jwt>&refreshToken=<rt>
 *
 * For brand-new Google sign-ups, the backend also appends:
 *   &isNewUser=true
 * In that case we show the CompleteProfileModal before navigating home.
 */
export default function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);

  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') ?? '';
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (!accessToken) {
      setError('Đăng nhập Google thất bại. Không nhận được token.');
      return;
    }

    // Store tokens → fetch profile
    login(accessToken, refreshToken);
    fetchCurrentUser()
      .then(() => {
        if (isNewUser) {
          // New Google user → show onboarding popup first
          setShowOnboarding(true);
        } else {
          redirectByRole();
        }
      })
      .catch(() => {
        setError('Không thể tải thông tin người dùng.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectByRole = () => {
    const user = useAuthStore.getState().user;
    if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else if (user?.role === 'LANDLORD') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  /** Called by CompleteProfileModal after the user saves their onboarding info */
  const handleOnboardingComplete = (role: 'USER' | 'LANDLORD') => {
    setShowOnboarding(false);
    if (role === 'LANDLORD') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
          <p className="text-on-surface font-medium">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-primary font-bold hover:underline"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading spinner — shown while fetching user or while onboarding modal is visible */}
      <div className="flex items-center justify-center min-h-screen bg-surface">
        {!showOnboarding && (
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">
              progress_activity
            </span>
            <p className="text-on-surface-variant font-medium">
              Đang xử lý đăng nhập Google…
            </p>
          </div>
        )}
      </div>

      {/* Onboarding modal — overlays the spinner for new users */}
      {showOnboarding && (
        <CompleteProfileModal onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}
