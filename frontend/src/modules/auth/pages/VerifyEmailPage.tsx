import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../../layouts/AuthLayout';
import authService from '../../../services/authService';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Email passed from RegisterPage via navigation state
  const emailFromState = (location.state as { email?: string })?.email ?? '';
  const tokenFromUrl = searchParams.get('token');

  const [status, setStatus] = useState<VerifyStatus>(tokenFromUrl ? 'loading' : 'idle');
  const [message, setMessage] = useState('');

  // Auto-verify when token is present in URL (user clicked email link)
  useEffect(() => {
    if (!tokenFromUrl) return;

    const verify = async () => {
      try {
        const msg = await authService.verifyEmail(tokenFromUrl);
        setStatus('success');
        setMessage(msg);
      } catch {
        setStatus('error');
        setMessage(t('verify.errorDefault'));
      }
    };

    verify();
  }, [tokenFromUrl, t]);

  const handleResend = () => {
    // TODO: backend doesn't have a resend endpoint yet
    // For now, instruct users to register again or wait
  };

  return (
    <AuthLayout variant="standard">
      {/* Animated icon */}
      <div className="flex justify-center lg:justify-start mb-6">
        <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center animate-bounce">
          <span className="material-symbols-outlined text-4xl text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
            {status === 'success' ? 'mark_email_read' : status === 'error' ? 'error' : 'mark_email_read'}
          </span>
        </div>
      </div>

      <div className="mb-8 text-center lg:text-left">
        <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
          {status === 'success' ? t('verify.successTitle') : status === 'error' ? t('verify.errorTitle') : t('verify.title')}
        </h2>

        {/* Show verification result or waiting instructions */}
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            {t('verify.verifying')}
          </div>
        )}
        {status === 'success' && (
          <p className="text-on-surface-variant leading-relaxed">{message}</p>
        )}
        {status === 'error' && (
          <p className="text-error leading-relaxed">{message}</p>
        )}
        {status === 'idle' && (
          <p className="text-on-surface-variant leading-relaxed">
            {t('verify.desc1')}{' '}
            <strong className="text-on-surface">{emailFromState || 'your email'}</strong>.{' '}
            {t('verify.desc2')}
          </p>
        )}
      </div>

      {/* Tips — only show when waiting for email */}
      {status === 'idle' && (
        <div className="bg-surface-container-low rounded-lg p-5 space-y-3 mb-8">
          <h4 className="font-label font-bold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">tips_and_updates</span>
            {t('verify.tipsTitle')}
          </h4>
          <ul className="text-xs text-on-surface-variant space-y-2 pl-7">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">check_circle</span>
              <span dangerouslySetInnerHTML={{ __html: t('verify.tip1HTML') }} />
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">check_circle</span>
              {t('verify.tip2Prefix')} <strong>{emailFromState || 'your email'}</strong> {t('verify.tip2Suffix')}
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">check_circle</span>
              {t('verify.tip3')}
            </li>
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {status === 'success' ? (
          <Link
            to="/login"
            className="w-full py-4 px-6 btn-gradient text-on-primary font-headline font-bold rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">login</span>
            {t('verify.goToLogin')}
          </Link>
        ) : (
          <>
            <button
              onClick={handleResend}
              className="w-full py-4 px-6 btn-gradient text-on-primary font-headline font-bold rounded-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              {t('verify.resend')}
            </button>

            <Link
              to="/login"
              className="w-full py-4 px-6 bg-surface-container-low border border-outline-variant/20 text-on-surface font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              {t('verify.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
