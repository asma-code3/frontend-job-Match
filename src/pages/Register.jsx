import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineUserCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUserPlus,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { HiCheck, HiX } from 'react-icons/hi';
import StatusAlert from '../components/StatusAlert';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [honeypot, setHoneypot] = useState('');

  const [topMessage, setTopMessage] = useState('');
  const [topType, setTopType] = useState('error');
  const [toastOut, setToastOut] = useState(false);
  const inputBaseClass = 'h-11 w-full rounded-2xl border border-[var(--line-soft)] bg-white/90 px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:bg-white focus:ring-4 focus:ring-blue-100';
  const labelClass = 'text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500';
  const idleRoleClass = 'border-[var(--line-soft)] bg-white/80 text-slate-600 hover:border-[var(--line-strong)] hover:bg-blue-50/60';

  const { register } = useAuth();
  const navigate = useNavigate();

  const closeToast = () => {
    setToastOut(true);
    setTimeout(() => {
      setTopMessage('');
      setToastOut(false);
    }, 400);
  };

  const showToast = (msg, type) => {
    setTopMessage(msg);
    setTopType(type);
    setToastOut(false);
  };

  const emailValid = useMemo(() => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
  }, [email]);

  const passwordRules = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-~`]/.test(password),
  }), [password]);

  const passwordValid = useMemo(() => Object.values(passwordRules).every(Boolean), [passwordRules]);
  const nameValid = name.trim().length >= 2 && name.trim().length <= 80;
  const confirmPasswordValid = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMissing = useMemo(() => {
    const missing = [];
    if (!passwordRules.length) missing.push('8+ characters');
    if (!passwordRules.uppercase) missing.push('an uppercase letter');
    if (!passwordRules.lowercase) missing.push('a lowercase letter');
    if (!passwordRules.number) missing.push('a number');
    if (!passwordRules.special) missing.push('a special character');
    return missing;
  }, [passwordRules]);

  const strength = useMemo(() => {
    const score = Object.values(passwordRules).filter(Boolean).length;
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  }, [passwordRules]);

  useEffect(() => {
    setMessage('');
  }, [name, email, password, confirmPassword, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) {
      showToast("Spam detected.", "error");
      return;
    }

    if (!nameValid) {
      showToast("Full name must be between 2 and 80 characters.", "error");
      setTimeout(() => closeToast(), 3000);
      return;
    }

    if (!emailValid) {
      showToast("Please enter a valid email address.", "error");
      setTimeout(() => closeToast(), 3000);
      return;
    }

    if (!passwordValid) {
      showToast("Password must include uppercase, lowercase, number, and special character.", "error");
      setTimeout(() => closeToast(), 3000);
      return;
    }

    if (!confirmPasswordValid) {
      showToast("Passwords do not match", "error");
      setTimeout(() => closeToast(), 3000);
      return;
    }

    setSubmitting(true);
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim().toLowerCase();

    const result = await register(cleanName, cleanEmail, password, role);
    setSubmitting(false);

    if (result.ok) {
      showToast("Account created! Please login to continue.", "success");
      
      setTimeout(() => {
        closeToast();
        setTimeout(() => navigate('/login'), 400);
      }, 2500);

    } else {
      showToast(result.message, "error");
      setTimeout(() => closeToast(), 3000);
    }
  };

  const isFormValid = emailValid && passwordValid && confirmPasswordValid && nameValid;

  return (
    <div className="page-shell flex items-center justify-center px-4">

      {topMessage && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold max-w-sm
            ${topType === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'}
            ${toastOut ? 'animate-[toastOut_0.4s_ease-in_forwards]' : 'animate-[toastIn_0.45s_cubic-bezier(0.16,1,0.3,1)_forwards]'}
          `}
        >
          <span className="flex-shrink-0">
            {topType === 'success' ? <HiOutlineCheckCircle className="h-5 w-5" /> : <HiOutlineXCircle className="h-5 w-5" />}
          </span>
          <span className="leading-snug">{topMessage}</span>
          <button onClick={closeToast} className="flex-shrink-0 ml-1 rounded-lg p-0.5 hover:bg-white/20 transition-colors">
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.9))] shadow-[var(--shadow-soft)] backdrop-blur">
        <section className="relative p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_70%)]" />
          <div className="mx-auto w-full max-w-sm">

            <div className="relative mb-5 text-center">
              <span className="inline-flex rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                Create Account
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Register</h2>
              <p className="text-sm text-slate-500">Join and start using system</p>
            </div>

            <StatusAlert message={message} variant="error" onClose={() => setMessage('')} className="mb-4" />

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>

              <input
                type="text"
                name="company_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 h-0 w-0 top-[-9999px] left-[-9999px]"
              />

              <input
                className={`${inputBaseClass} ${name && !nameValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
              {name && !nameValid && <p className="px-1 text-[11px] text-red-500">Name must be between 2 and 80 characters.</p>}

              <input
                type="email"
                className={`${inputBaseClass} ${email && !emailValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <div className="space-y-2">
                <input
                  type="password"
                  className={`${inputBaseClass} ${password && !passwordValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                />

                <div className="flex items-center gap-2 px-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength.score >= i ? strength.color : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 text-right">{strength.label}</span>
                </div>

                {password.length > 0 && (
                  <div className={`flex items-start gap-2 rounded-2xl border px-3 py-2 text-[11px] ${passwordValid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    {passwordValid ? <HiCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> : <HiX className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />}
                    <span>
                      {passwordValid ? 'Password looks strong.' : `Missing: ${passwordMissing.join(', ')}`}
                    </span>
                  </div>
                )}
              </div>

              <input
                type="password"
                className={`${inputBaseClass} ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && !confirmPasswordValid && <p className="px-1 text-[11px] text-red-500">Passwords must match exactly.</p>}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`cursor-pointer rounded-2xl border p-3 font-semibold transition-all ${role === 'seeker' ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 shadow-sm' : idleRoleClass}`}>
                  <input hidden type="radio" checked={role === 'seeker'} onChange={() => setRole('seeker')} />
                  <div className="flex items-center gap-2">
                    <HiOutlineUserCircle className="h-4 w-4" />
                    Seeker
                  </div>
                </label>

                <label className={`cursor-pointer rounded-2xl border p-3 font-semibold transition-all ${role === 'employer' ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 shadow-sm' : idleRoleClass}`}>
                  <input hidden type="radio" checked={role === 'employer'} onChange={() => setRole('employer')} />
                  <div className="flex items-center gap-2">
                    <HiOutlineBriefcase className="h-4 w-4" />
                    Employer
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--brand-800)] via-[var(--brand-700)] to-[var(--accent-500)] text-sm font-semibold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {submitting ? (
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <HiOutlineUserPlus className="h-5 w-5" />
                    Sign Up
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-500">
              Already have account?{' '}
              <Link className="font-semibold text-blue-600" to="/login">Login</Link>
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

export default Register;
