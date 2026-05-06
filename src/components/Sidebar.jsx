import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

import { 
  HiOutlineHome, 
  HiOutlineMagnifyingGlass, 
  HiOutlineDocumentText, 
  HiOutlineUser, 
  HiOutlinePlusCircle, 
  HiOutlineBriefcase, 
  HiOutlineUserGroup, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowRightOnRectangle,
  HiOutlineXMark 
} from 'react-icons/hi2';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/jobs');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const icons = {
    home: <HiOutlineHome className="w-3.5 h-3.5" />,
    search: <HiOutlineMagnifyingGlass className="w-4 h-4" />,
    file: <HiOutlineDocumentText className="w-4 h-4" />,
    user: <HiOutlineUser className="w-4 h-4" />,
    plus: <HiOutlinePlusCircle className="w-4 h-4" />,
    briefcase: <HiOutlineBriefcase className="w-4 h-4" />,
    users: <HiOutlineUserGroup className="w-4 h-4" />,
    settings: <HiOutlineCog6Tooth className="w-4 h-4" />,
    logout: <HiOutlineArrowRightOnRectangle className="w-4 h-4" />,
    close: <HiOutlineXMark className="w-5 h-5" />
  };

  const seekerLinks = [
    { path: '/jobs', label: 'Browse Jobs', icon: 'search' },
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/find-jobs', label: 'Find Jobs', icon: 'search' },
    { path: '/applications', label: 'Applications', icon: 'file' },
    { path: '/profile', label: 'My Profile', icon: 'user' },
  ];

  const employerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/post-job', label: 'Post New Job', icon: 'plus' },
    { path: '/manage-jobs', label: 'Manage Jobs', icon: 'briefcase' },
    { path: '/applicants', label: 'Applicants', icon: 'users' },
    { path: '/company-settings', label: 'Settings', icon: 'settings' },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Dashboard', icon: 'home' },
    { path: '/find-jobs', label: 'Find Jobs', icon: 'search' },
    { path: '/applications', label: 'Applications', icon: 'file' },
    { path: '/profile', label: 'My Profile', icon: 'user' },
    { path: '/jobs', label: 'Browse Jobs', icon: 'search' },
    { path: '/post-job', label: 'Post New Job', icon: 'plus' },
    { path: '/manage-jobs', label: 'Manage Jobs', icon: 'briefcase' },
    { path: '/applicants', label: 'Applicants', icon: 'users' },
    { path: '/company-settings', label: 'Settings', icon: 'settings' },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'employer'
      ? employerLinks
      : seekerLinks;
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/55 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-72 max-w-[88vw]
        ${isAdmin ? 'bg-slate-950/95 border-blue-900/60 shadow-[0_18px_50px_rgba(15,23,42,0.42)]' : 'bg-white/95 border-slate-200 shadow-xl'}
        backdrop-blur flex flex-col
        transition-transform duration-300 ease-in-out

        -translate-x-full
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : ''}
      `}>

        <div className={`h-16 flex items-center justify-between px-6 border-b backdrop-blur-md ${isAdmin ? 'border-blue-900/60 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
          <Link to="/jobs" onClick={handleLinkClick} className="inline-flex flex-1 items-center">
            <Logo size={32} variant={isAdmin ? 'navbar' : 'default'} />
          </Link>
          <button
            onClick={toggleSidebar}
            className={`lg:hidden p-2 rounded-lg transition-colors ${isAdmin ? 'text-blue-100 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'}`}
          >
            {icons.close}
          </button>
        </div>

        <div className={`mx-4 mt-6 rounded-2xl border p-4 shadow-sm ${isAdmin ? 'border-blue-900/60 bg-gradient-to-br from-slate-900 to-blue-950 text-white' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold shadow text-lg ${isAdmin ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-slate-950 ring-4 ring-white/10' : 'bg-blue-700 text-white ring-4 ring-blue-50'}`}>
              <HiOutlineUser className="h-6 w-6" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className={`text-sm font-bold truncate ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
                {user?.name}
              </h4>
              <p className={`text-xs font-medium capitalize flex items-center gap-2 ${isAdmin ? 'text-blue-100' : 'text-slate-500'}`}>
                <span className={`h-2 w-2 rounded-full ${
                  user?.role === 'admin' ? 'bg-cyan-300' : user?.role === 'employer' ? 'bg-emerald-500' : 'bg-blue-400'
                }`}></span>
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {!isEmployer ? (
          <div className="mx-4 mt-4">
            <Link
              to="/jobs"
              onClick={handleLinkClick}
              className="btn-secondary w-full py-2.5 text-sm"
            >
              Browse Jobs
            </Link>
          </div>
        ) : null}

        <nav className="flex-1 mt-7 px-3 space-y-1.5 overflow-y-auto">
          {!isEmployer ? (
            <p className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
              Seeker Menu
            </p>
          ) : null}

          {links.map((link) => {
            const active = isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden

                  ${active
                    ? isAdmin
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow font-semibold'
                      : 'bg-blue-700 text-white shadow font-semibold'
                    : isAdmin
                      ? 'text-blue-100 hover:bg-white/8 hover:text-white'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}
                `}
              >
                <span className={`
                  flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200
                  ${active
                    ? 'bg-white/20 text-white'
                    : isAdmin
                      ? 'text-blue-200 group-hover:bg-white/10 group-hover:text-white'
                      : 'text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-700'}
                `}>
                  {icons[link.icon]}
                </span>

                <span className="font-medium text-sm tracking-wide">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto mb-4 p-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group border ${
              isAdmin
                ? 'border-white/10 text-blue-100 hover:bg-rose-500/12 hover:text-white hover:border-rose-400/30 active:bg-red-600 active:text-white'
                : 'border-transparent text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:bg-red-600 active:text-white active:border-red-600'
            }`}
          >
            <span className={`${isAdmin ? 'text-blue-200 group-hover:text-rose-200' : 'text-slate-400 group-hover:text-rose-500'} group-active:text-white transition-colors`}>
              {icons.logout}
            </span>
            <span className="font-medium text-sm">
              Logout
            </span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;


