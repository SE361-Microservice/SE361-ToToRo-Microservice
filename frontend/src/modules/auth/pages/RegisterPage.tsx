import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../layouts/AuthLayout';
import FormInput from '../../../components/ui/FormInput';
import FormDivider from '../../../components/ui/FormDivider';
import GoogleOAuthButton from '../../../components/common/GoogleOAuthButton';
import RoleSelector from '../../../components/common/RoleSelector';
import type { UserRole } from '../../../components/common/RoleSelector';
import authService from '../../../services/authService';
import axios from 'axios';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('USER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError(t('register.errorPasswordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('register.errorPasswordMin'));
      return;
    }

    setLoading(true);
    try {
      await authService.register({ email, password, fullName, role });
      // Navigate to verify email page, passing email in state
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message || t('register.errorDefault');
        setError(msg);
      } else {
        setError(t('register.errorDefault'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="standard">
      {/* Header */}
      <div className="mb-10 text-center lg:text-left">
        <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
          {t('register.title')}
        </h2>
        <p className="text-on-surface-variant">
          {t('register.subtitle')}
        </p>
      </div>

      {/* Role Selector */}
      <RoleSelector selected={role} onChange={setRole} className="mb-8" />

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error-container text-on-error-container text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          id="reg-fullname"
          label={t('register.fullname')}
          placeholder={t('register.fullnamePlaceholder')}
          variant="register"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <FormInput
          id="reg-email"
          label={t('register.email')}
          type="email"
          placeholder={t('register.emailPlaceholder')}
          variant="register"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="reg-password"
            label={t('register.password')}
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            variant="register"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormInput
            id="reg-confirm"
            label={t('register.confirm')}
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            variant="register"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary bg-surface-container-high border-none"
          />
          <label htmlFor="terms" className="text-sm text-on-surface-variant leading-relaxed">
            {t('register.termsAgree')}{' '}
            <Link to="/terms" className="text-primary font-semibold underline underline-offset-2">
              {t('register.termsOfService')}
            </Link>{' '}
            {t('register.and')}{' '}
            <Link to="/privacy" className="text-primary font-semibold underline underline-offset-2">
              {t('register.privacyPolicy')}
            </Link>{' '}
            {t('register.termsSuffix')}
          </label>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 btn-gradient text-on-primary font-headline font-bold rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          ) : (
            t('register.submit')
          )}
        </button>
      </form>

      {/* Divider */}
      <FormDivider label={t('auth.or')} />

      {/* Google OAuth */}
      <GoogleOAuthButton variant="register" label={t('auth.google')} />

      <p className="mt-8 text-center text-on-surface-variant">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          {t('register.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
