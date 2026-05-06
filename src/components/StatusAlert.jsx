import React, { useEffect } from 'react';
import {
  HiCheckCircle,
  HiInformationCircle,
  HiXCircle,
  HiXMark,
} from 'react-icons/hi2';

const VARIANT_STYLES = {
  success: {
    wrapper: 'border-emerald-200 bg-white text-emerald-800 shadow-[0_18px_40px_rgba(16,185,129,0.18)]',
    icon: 'text-emerald-600',
    button: 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700',
  },
  error: {
    wrapper: 'border-rose-200 bg-white text-rose-800 shadow-[0_18px_40px_rgba(244,63,94,0.16)]',
    icon: 'text-rose-600',
    button: 'text-rose-500 hover:bg-rose-50 hover:text-rose-700',
  },
  info: {
    wrapper: 'border-sky-200 bg-white text-sky-800 shadow-[0_18px_40px_rgba(14,165,233,0.14)]',
    icon: 'text-sky-600',
    button: 'text-sky-500 hover:bg-sky-50 hover:text-sky-700',
  },
};

const ICONS = {
  success: HiCheckCircle,
  error: HiXCircle,
  info: HiInformationCircle,
};

const StatusAlert = ({
  message,
  variant = 'success',
  onClose,
  autoHide = false,
  duration = 2600,
  floating = false,
  className = '',
}) => {
  useEffect(() => {
    if (!message || !autoHide || !onClose) return undefined;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [autoHide, duration, message, onClose]);

  if (!message) return null;

  const tone = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  const Icon = ICONS[variant] || ICONS.info;

  return (
    <div className={`${floating ? 'fixed right-4 top-24 z-[70] animate-[fadeIn_0.25s_ease-out]' : ''} ${className}`}>
      <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${tone.wrapper}`}>
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${tone.icon}`} />
        <span className="flex-1 leading-6">{message}</span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${tone.button}`}
            aria-label="Close message"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default StatusAlert;
