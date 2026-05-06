import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineLockClosed,
  HiOutlineUserCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineXMark,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const LOGIN_DRAFT_KEY = 'jobmatch_login_draft';
const REMEMBERED_EMAIL_KEY = 'jobmatch_remembered_email';

const Login = () => {
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return '';

    try {
      const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (rememberedEmail) return rememberedEmail;
      const savedDraft = sessionStorage.getItem(LOGIN_DRAFT_KEY);
      return savedDraft ? JSON.parse(savedDraft).email || '' : '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return 'seeker';

    try {
      const savedDraft = sessionStorage.getItem(LOGIN_DRAFT_KEY);
      return savedDraft ? JSON.parse(savedDraft).role || 'seeker' : 'seeker';
    } catch {
      return 'seeker';
    }
  });
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === 'undefined') return false;

    try {
      return Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY));
    } catch {
      return false;
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'error',
    isLeaving: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const timersRef = useRef([]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const passwordValid = password.length >= 8 && password.length <= 72;
  const isFormReady = emailValid && passwordValid;

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    sessionStorage.setItem(
      LOGIN_DRAFT_KEY,
      JSON.stringify({
        email,
        role,
      })
    );
  }, [email, role]);

  const safeTimeout = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isLeaving: true }));
    safeTimeout(() => {
      setToast({ message: '', type: 'error', isLeaving: false });
    }, 400);
  }, [safeTimeout]);

  const showToast = useCallback((message, type) => {
    setToast({ message, type, isLeaving: false });
  }, []);

  const inputBaseClass =
    'h-11 w-full rounded-mg border border-[var(--line-soft)] bg-white/90 px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:bg-white focus:ring-4 focus:ring-blue-100';
  const labelClass = 'text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500';
  const idleRoleClass =
    'border-[var(--line-soft)] bg-white/80 text-slate-600 hover:border-[var(--line-strong)] hover:bg-blue-50/60';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!emailValid) {
      showToast('Enter a valid email address.', 'error');
      safeTimeout(closeToast, 3000);
      return;
    }

    if (!passwordValid) {
      showToast('Password must be between 8 and 72 characters.', 'error');
      safeTimeout(closeToast, 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login(email.trim().toLowerCase(), password, role);

      if (result.ok) {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim().toLowerCase());
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
        if (result.actualRole && result.actualRole !== 'admin') {
          setRole(result.actualRole);
        }
        setEmail('');
        setPassword('');
        sessionStorage.removeItem(LOGIN_DRAFT_KEY);
        showToast(result.message || 'Login successful!', 'success');
        safeTimeout(() => {
          closeToast();
          safeTimeout(() => navigate('/dashboard'), 400);
        }, 1500);
        return;
      }

      showToast(result.message || 'Incorrect email or password', 'error');
      safeTimeout(closeToast, 3000);
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      safeTimeout(closeToast, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex items-center justify-center px-4  ">
      {toast.message && (
        <div
          className={`fixed right-6 top-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg
            ${toast.type === 'success' ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-red-500 bg-red-600 text-white'}
            ${toast.isLeaving ? 'animate-[toastOut_0.4s_ease-in_forwards]' : 'animate-[toastIn_0.45s_cubic-bezier(0.16,1,0.3,1)_forwards]'}
          `}
        >
          <span className="flex-shrink-0">
            {toast.type === 'success' ? (
              <HiOutlineCheckCircle className="h-5 w-5" />
            ) : (
              <HiOutlineXCircle className="h-5 w-5" />
            )}
          </span>
          <span className="leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={closeToast}
            className="ml-1 flex-shrink-0 rounded-lg p-0.5 transition-colors hover:bg-white/20"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-md bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.9))] shadow-[var(--shadow-soft)] backdrop-blur">
        <section className="relative p-5 md:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_70%)]" />
          <div className="mx-auto w-full max-w-sm">
            <div className="relative mb-5 text-center">
              <span className="inline-flex rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                Secure Access
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Sign In</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass} htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className={`${inputBaseClass} ${email && !emailValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Enter email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass} htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputBaseClass} pr-11 ${password && !passwordValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 inline-flex items-center text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Must be at least 8 characters.</p>
              </div>

              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember my email
              </label>

              <div className="space-y-2">
                <label className={labelClass}>Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`cursor-pointer rounded-2xl border p-3 text-xs font-semibold transition-all ${
                      role === 'seeker'
                        ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 shadow-sm'
                        : idleRoleClass
                    }`}
                  >
                    <input
                      type="radio"
                      value="seeker"
                      checked={role === 'seeker'}
                      onChange={() => setRole('seeker')}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <HiOutlineUserCircle className="h-4 w-4" />
                      Seeker
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer rounded-2xl border p-3 text-xs font-semibold transition-all ${
                      role === 'employer'
                        ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 shadow-sm'
                        : idleRoleClass
                    }`}
                  >
                    <input
                      type="radio"
                      value="employer"
                      checked={role === 'employer'}
                      onChange={() => setRole('employer')}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <HiOutlineLockClosed className="h-4 w-4" />
                      Employer
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-colors focus:ring-4 focus:ring-blue-100 ${
                  isSubmitting
                    ? 'cursor-wait bg-blue-500'
                    : isFormReady
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                } cursor-pointer`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.25"
                      />
                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600">
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes toastIn {
          0% { opacity: 0; transform: translateX(80px) scale(0.9); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(80px) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default Login;
