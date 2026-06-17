import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../layouts/AuthLayout';
import FormInput from '../../../components/ui/FormInput';
import authService from '../../../services/authService';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const msg = await authService.forgotPassword({ email });
      setSuccess(msg);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const msg = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message || t('forgot.errorDefault');
        setError(msg);
      } else {
        setError(t('forgot.errorDefault'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="standard">
      {/* Icon */}
      <div className="flex justify-center lg:justify-start mb-6">
        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-primary-container">lock_reset</span>
        </div>
      </div>

      <div className="mb-10 text-center lg:text-left">
        <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
          {t('forgot.title')}
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          {t('forgot.desc')}{' '}
          {t('forgot.descExpiry')} <strong className="text-on-surface">{t('forgot.descExpiryTime')}</strong>.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-error-container text-on-error-container text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 p-4 rounded-lg bg-tertiary-container text-on-tertiary-container text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="forgot-email"
          label={t('forgot.emailLabel')}
          type="email"
          placeholder={t('forgot.emailPlaceholder')}
          variant="register"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 btn-gradient text-on-primary font-headline font-bold rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">send</span>
              {t('forgot.submit')}
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-on-surface-variant text-sm">
        {t('forgot.remember')}{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          {t('forgot.backToLogin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
