import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../layouts/AuthLayout';
import FormInput from '../../../components/ui/FormInput';
import authService from '../../../services/authService';
import axios from 'axios';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('reset.errorNoToken'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('reset.errorPasswordMismatch'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('reset.errorPasswordMin'));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message || t('reset.errorDefault');
        setError(msg);
      } else {
        setError(t('reset.errorDefault'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="standard">
      {/* Icon */}
      <div className="flex justify-center lg:justify-start mb-6">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-secondary-container">password</span>
        </div>
      </div>

      <div className="mb-10 text-center lg:text-left">
        <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
          {t('reset.title')}
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          {t('reset.desc')} <strong className="text-on-surface">{t('reset.descMinChars')}</strong>.
        </p>
      </div>

      {/* Password strength visual hint */}
      <div className="bg-surface-container-low rounded-lg p-4 mb-6 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">shield</span>
        <div className="text-xs text-on-surface-variant space-y-1">
          <p className="font-bold text-on-surface text-sm">{t('reset.hintTitle')}</p>
          <p>• {t('reset.hint1')}</p>
          <p>• {t('reset.hint2')}</p>
          <p>• {t('reset.hint3')}</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error-container text-on-error-container text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          id="reset-password"
          label={t('reset.newPassword')}
          type="password"
          placeholder={t('reset.placeholder')}
          variant="register"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <FormInput
          id="reset-confirm"
          label={t('reset.confirmPassword')}
          type="password"
          placeholder={t('reset.placeholder')}
          variant="register"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 btn-gradient text-on-primary font-headline font-bold rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">check_circle</span>
              {t('reset.submit')}
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-on-surface-variant text-sm">
        <Link to="/login" className="text-primary font-bold hover:underline flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {t('reset.backToLogin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
