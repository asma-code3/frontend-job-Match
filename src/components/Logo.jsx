import React from 'react';

const Logo = ({ size = 40, compact = false, variant = 'default' }) => {
  const isNavbar = variant === 'navbar';
  const circleColor = isNavbar ? '#ffffff' : 'var(--brand-800)';
  const accentColor = isNavbar ? '#38bdf8' : 'var(--accent-500)';
  const mainTextColor = isNavbar ? '#ffffff' : 'var(--text-main)';
  const brandTextColor = isNavbar ? '#bfdbfe' : 'var(--brand-700)';
  const subtleTextColor = isNavbar ? 'rgba(255,255,255,0.78)' : 'var(--text-subtle)';

  return (
    <div className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" style={{ fill: circleColor }} />
        <path
          d="M12 14C12 11.7909 13.7909 10 16 10H18C20.2091 10 22 11.7909 22 14V26C22 28.2091 20.2091 30 18 30H16C13.7909 30 12 28.2091 12 26V14Z"
          fill={isNavbar ? '#1e3a8a' : 'white'}
          opacity="0.9"
        />
        <path
          d="M18 17C18 14.7909 19.7909 13 22 13H24C26.2091 13 28 14.7909 28 17V23C28 25.2091 26.2091 27 24 27H22C19.7909 27 18 25.2091 18 23V17Z"
          style={{ fill: accentColor }}
        />
        <path
          d="M17 20L20 23L24 18"
          stroke={isNavbar ? '#1e3a8a' : 'white'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className={`flex flex-col leading-none ${compact ? 'hidden sm:flex' : ''}`}>
        <span className="text-[1.15rem] font-extrabold tracking-tight" style={{ color: mainTextColor }}>
          Job<span style={{ color: brandTextColor }}>Match</span>
        </span>
        <span
          className={`-mt-0.5 text-[0.58rem] uppercase tracking-[0.14em] ${compact ? 'hidden md:inline' : ''}`}
          style={{ color: subtleTextColor }}
        >
          Career Platform
        </span>
      </div>
    </div>
  );
};

export default Logo;
