import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../layouts/AuthLayout';
import FormInput from '../../../components/ui/FormInput';
import FormDivider from '../../../components/ui/FormDivider';
import GoogleOAuthButton from '../../../components/common/GoogleOAuthButton';
import authService from '../../../services/authService';
import useAuthStore from '../../../store/authStore';
import axios from 'axios';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      login(res.accessToken, res.refreshToken);

      // Fetch user profile to determine role-based redirect
      const { fetchCurrentUser } = useAuthStore.getState();
      await fetchCurrentUser();
      const user = useAuthStore.getState().user;

      if (from) {
        navigate(from);
      } else if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else if (user?.role === 'LANDLORD') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        // Backend returns error message as string or in `message` field
        const msg = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message || t('login.errorDefault');
        setError(msg);
      } else {
        setError(t('login.errorDefault'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="standard">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
          {t('login.title')}
        </h2>
        <p className="text-on-surface-variant">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error-container text-on-error-container text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="login-email"
          label={t('login.email')}
          type="email"
          placeholder={t('login.emailPlaceholder')}
          variant="login"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          id="login-password"
          label={t('login.password')}
          type="password"
          placeholder="••••••••"
          variant="login"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightAction={
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
              {t('login.forgot')}
            </Link>
          }
        />

        {/* Remember me */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="remember"
            className="w-5 h-5 rounded border-outline-variant/30 text-primary focus:ring-primary"
          />
          <label htmlFor="remember" className="text-sm text-on-surface-variant">
            {t('login.remember')}
          </label>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 btn-gradient text-on-primary font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          ) : (
            <>
              {t('login.submit')}
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </>
          )}
        </button>
      </form>
      
      {/* Divider */}
      <FormDivider label={t('auth.or')} />

      {/* Google OAuth */}
      <GoogleOAuthButton variant="register" label={t('auth.google')} />

      <footer className="mt-10 text-center">
        <p className="text-on-surface-variant text-sm">
          {t('login.noAccount')}
          <Link to="/register" className="text-primary font-bold hover:underline ml-1">
            {t('login.registerNow')}
          </Link>
        </p>
      </footer>
    </AuthLayout>
  );
}
