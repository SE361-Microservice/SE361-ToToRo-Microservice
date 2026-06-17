import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

/**
 * OAuth2 redirect landing page.
 *
 * After Google login, the backend's OAuth2AuthenticationSuccessHandler
 * redirects here with:  /oauth2/redirect?token=<jwt>&refreshToken=<rt>
 *
 * This page extracts the tokens, stores them, fetches the user profile,
 * then navigates to /home.
 */
export default function OAuthRedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') ?? '';

    if (!accessToken) {
      setError('Đăng nhập Google thất bại. Không nhận được token.');
      return;
    }

    // Store tokens → fetch profile → go to home
    login(accessToken, refreshToken);
    fetchCurrentUser()
      .then(() => {
        const user = useAuthStore.getState().user;
        if (user?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (user?.role === 'LANDLORD') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      })
      .catch(() => {
        setError('Không thể tải thông tin người dùng.');
      });
  }, [searchParams, login, fetchCurrentUser, navigate]);

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
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-on-surface-variant font-medium">
          Đang xử lý đăng nhập Google…
        </p>
      </div>
    </div>
  );
}
