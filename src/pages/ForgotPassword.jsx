import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { resetPasswordUser } from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8 && password.length <= 72,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      noSpaces: !/\s/.test(password),
    }),
    [password]
  );
  const passwordValid = useMemo(() => Object.values(passwordRules).every(Boolean), [passwordRules]);
  const confirmValid = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!emailValid) {
      setMessageType('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    if (!passwordValid) {
      setMessageType('error');
      setMessage('Password must be 8-72 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    if (!confirmValid) {
      setMessageType('error');
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await resetPasswordUser({
        email: email.trim().toLowerCase(),
        password,
      });
      setMessageType('success');
      setMessage(result.message || 'Password reset successful. You can now sign in.');
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClass =
    'h-11 w-full rounded-2xl border border-[var(--line-soft)] bg-white/90 px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:bg-white focus:ring-4 focus:ring-blue-100';

  return (
    <div className="page-shell flex items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.9))] shadow-[var(--shadow-soft)] backdrop-blur">
        <section className="relative p-5 md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_70%)]" />
          <div className="mx-auto w-full max-w-sm">
            <div className="relative mb-5 text-center">
              <span className="inline-flex rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                Account Recovery
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Forgot Password</h2>
              <p className="mt-1 text-sm text-slate-500">Set a new password for your account</p>
            </div>

            {message ? (
              <div
                className={`mb-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
                  messageType === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {messageType === 'success' ? (
                  <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                ) : (
                  <HiOutlineXCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                )}
                <span>{message}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                className={inputBaseClass}
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <input
                type="password"
                className={inputBaseClass}
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />

              <input
                type="password"
                className={inputBaseClass}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-colors focus:ring-4 focus:ring-blue-100 ${
                  submitting ? 'cursor-wait bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
                {!submitting ? <HiOutlineArrowRight className="h-5 w-5" /> : null}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-blue-600">
                Back to Sign In
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
