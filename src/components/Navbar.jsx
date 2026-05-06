import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { HiOutlineArrowRightOnRectangle, HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    if (!user) {
      return [{ path: '/jobs', label: 'Browse Jobs' }];
    }

    if (user.role === 'employer') {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/post-job', label: 'Post Job' },
        { path: '/manage-jobs', label: 'Manage Jobs' },
        { path: '/applicants', label: 'Applicants' },
        { path: '/company-settings', label: 'Settings' },
      ];
    }
    if (user.role === 'admin') {
      return [
        { path: '/admin', label: 'Admin' },
        { path: '/find-jobs', label: 'Find Jobs' },
        { path: '/applications', label: 'Applications' },
        { path: '/profile', label: 'Profile' },
        { path: '/jobs', label: 'Browse Jobs' },
        { path: '/post-job', label: 'Post Job' },
        { path: '/manage-jobs', label: 'Manage Jobs' },
        { path: '/applicants', label: 'Applicants' },
        { path: '/company-settings', label: 'Settings' },
      ];
    }

    return [
      { path: '/jobs', label: 'Browse Jobs' },
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/find-jobs', label: 'Find Jobs' },
      { path: '/applications', label: 'Applications' },
      { path: '/profile', label: 'My Profile' },
    ];
  }, [user]);

  const userInitials = useMemo(() => {
    const fullName = String(user?.name || '').trim();
    if (!fullName) return 'U';
    return fullName.charAt(0).toUpperCase();
  }, [user?.name]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setIsMenuOpen(false);
  const desktopLinkClass = (path) =>
    `inline-flex min-h-[40px] items-center rounded-full px-3.5 text-sm font-semibold leading-none tracking-[0.01em] transition ${
      isActive(path)
        ? 'bg-white text-blue-900 shadow-[0_10px_24px_rgba(255,255,255,0.22)]'
        : 'text-blue-50 hover:bg-white/12 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/15 bg-[linear-gradient(90deg,_rgba(15,23,42,0.92),_rgba(30,64,175,0.95),_rgba(14,116,144,0.9))] shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-2xl bg-white/10 px-2.5 py-1.5 ring-1 ring-white/20 transition hover:bg-white/14"
          onClick={closeMenu}
        >
          <Logo size={36} compact variant="navbar" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={desktopLinkClass(item.path)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden min-h-[40px] items-center rounded-full border border-white/30 bg-white/10 px-2.5 sm:flex">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold uppercase leading-none text-blue-900">
                  {userInitials}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex min-h-[40px] items-center gap-1 rounded-full bg-white/14 px-3.5 sm:px-4 text-sm font-semibold leading-none tracking-[0.01em] text-white transition hover:bg-white/22 active:bg-red-600 active:text-white"
              >
                <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="hidden min-h-[40px] items-center rounded-full px-3 text-sm font-semibold leading-none tracking-[0.01em] text-white transition hover:bg-white/15 sm:inline-flex"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="inline-flex min-h-[40px] items-center rounded-full bg-white px-4 sm:px-5 text-sm font-semibold leading-none tracking-[0.01em] text-blue-900 transition hover:bg-blue-50"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiOutlineXMark className="h-5 w-5" /> : <HiOutlineBars3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-white/15 bg-[rgba(23,37,84,0.92)] px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`inline-flex min-h-[40px] items-center rounded-xl px-3.5 text-sm font-semibold leading-none tracking-[0.01em] transition ${
                  isActive(item.path)
                    ? 'bg-white text-blue-900'
                    : 'text-white hover:bg-white/12'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
