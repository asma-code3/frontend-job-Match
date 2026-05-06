import React, { useEffect, useState } from 'react';
import {
  HiOutlineUsers,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineXMark,
} from 'react-icons/hi2';
import {
  deleteAdminJob,
  deleteAdminUser,
  deleteAdminApplication,
  getAdminApplications,
  getAdminJobs,
  getAdminOverview,
  getAdminUsers,
  updateAdminApplication,
  updateAdminUserSecurity,
  updateAdminUserRole,
} from '../services/adminService';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState({ type: '', id: '' });
  const [noticeClosing, setNoticeClosing] = useState(false);
  const panelClass = 'overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-white/88 shadow-[var(--shadow-soft)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]';
  const tableHeaderClass = 'text-left text-xs font-bold uppercase tracking-[0.18em]';
  const userTableRowClass = 'border-t border-blue-100/90 align-top transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50/70 hover:shadow-[inset_4px_0_0_0_rgba(59,130,246,0.75)]';
  const jobsTableRowClass = 'border-t border-emerald-100/90 align-top transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/70 hover:shadow-[inset_4px_0_0_0_rgba(16,185,129,0.75)]';
  const applicationsTableRowClass = 'border-t border-amber-100/90 align-top transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50/70 hover:shadow-[inset_4px_0_0_0_rgba(245,158,11,0.78)]';
  const selectClass = 'min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100';
  const inputClass = 'min-h-[40px] w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100';
  const chipClass = 'rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800';

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [o, u, j, a] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(),
        getAdminJobs(),
        getAdminApplications(),
      ]);
      setOverview(o);
      setUsers(u);
      setJobs(j);
      setApplications(a);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!notice) {
      setNoticeClosing(false);
      return undefined;
    }

    setNoticeClosing(false);

    const closeTimer = setTimeout(() => {
      setNoticeClosing(true);
    }, 2000);

    const clearTimer = setTimeout(() => {
      setNotice('');
      setNoticeClosing(false);
    }, 2400);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(clearTimer);
    };
  }, [notice]);

  const dismissNotice = () => {
    setNoticeClosing(true);
    setTimeout(() => {
      setNotice('');
      setNoticeClosing(false);
    }, 400);
  };

  const handleRoleChange = async (id, role) => {
    if (currentUser?.id === id && role !== 'admin') {
      setNotice('Admin cannot remove own admin role');
      return;
    }
    try {
      await updateAdminUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      setNotice('User role updated successfully.');
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Failed to update role'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (pendingDelete.type !== 'user' || pendingDelete.id !== id) {
      setPendingDelete({ type: 'user', id });
      setNotice('Click delete again to confirm user deletion.');
      return;
    }
    try {
      await deleteAdminUser(id);
      await loadAll();
      setNotice('User deleted successfully.');
      setPendingDelete({ type: '', id: '' });
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Failed to delete user'));
    }
  };

  const handleSecurityUpdate = async (id, payload) => {
    try {
      const updated = await updateAdminUserSecurity(id, payload);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      if (payload.newPassword !== undefined) {
        setPasswordDrafts((prev) => ({ ...prev, [id]: '' }));
      }
      setNotice('User security updated successfully.');
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Failed to update security'));
    }
  };

  const handleDeleteJob = async (id) => {
    if (pendingDelete.type !== 'job' || pendingDelete.id !== id) {
      setPendingDelete({ type: 'job', id });
      setNotice('Click delete again to confirm job deletion.');
      return;
    }
    try {
      await deleteAdminJob(id);
      await loadAll();
      setNotice('Job deleted successfully.');
      setPendingDelete({ type: '', id: '' });
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Failed to delete job'));
    }
  };

  const handleApplicationStatus = async (id, status) => {
    try {
      const updated = await updateAdminApplication(id, { status });
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
      setNotice('Application status updated successfully.');
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Failed to update application'));
    }
  };

  const handleDeleteApplication = async (id) => {
    if (pendingDelete.type !== 'application' || pendingDelete.id !== id) {
      setPendingDelete({ type: 'application', id });
      setNotice('Click delete again to confirm application deletion.');
      return;
    }
    try {
      await deleteAdminApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setNotice('Application deleted successfully.');
      setPendingDelete({ type: '', id: '' });
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Failed to delete application'));
    }
  };

  if (loading) return <div className="page-shell text-slate-600">Loading admin panel...</div>;
  if (error) return <div className="page-shell text-rose-600">{error}</div>;

  return (
    <div className="page-shell space-y-6">
      <div className={`${panelClass} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.28),_transparent_40%),radial-gradient(circle_at_right,_rgba(14,165,233,0.14),_transparent_28%)]" />
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 px-6 py-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
                <HiOutlineSparkles className="h-4 w-4" />
                Control Center
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">System Administration</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Manage users, jobs, applications, and platform security from one organized workspace.</p>
            </div>
            <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Users</p>
                <p className="mt-2 text-2xl font-black text-white">{overview?.users || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Admins</p>
                <p className="mt-2 text-2xl font-black text-white">{overview?.admins || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notice ? (
        <div className={`fixed right-6 top-6 z-50 ${noticeClosing ? 'animate-[adminToastOut_0.4s_ease-in_forwards]' : 'animate-[adminToastIn_0.45s_cubic-bezier(0.16,1,0.3,1)]'}`}>
          <div className="flex max-w-sm items-start gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 text-sm font-medium text-blue-900 shadow-2xl">
            <HiOutlineShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" />
            <p className="leading-6">{notice}</p>
            <button
              type="button"
              onClick={dismissNotice}
              className="rounded-lg p-1 text-blue-500 transition hover:bg-white/70 hover:text-blue-800"
            >
              <HiOutlineXMark className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`${panelClass} group p-5 lg:min-h-[200px] lg:bg-gradient-to-br lg:from-blue-50 lg:to-cyan-50`}>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <HiOutlineUsers className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Users</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{overview?.users || 0}</h3>
          <p className="mt-2 text-sm text-slate-600">Account oversight and access management.</p>
        </div>
        <div className={`${panelClass} group p-5 lg:min-h-[200px] lg:bg-gradient-to-br lg:from-emerald-50 lg:to-teal-50`}>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <HiOutlineBriefcase className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Jobs</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{overview?.jobs || 0}</h3>
          <p className="mt-2 text-sm text-slate-600">Published roles and moderation controls.</p>
        </div>
        <div className={`${panelClass} group p-5 lg:min-h-[200px] lg:bg-gradient-to-br lg:from-amber-50 lg:to-orange-50`}>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <HiOutlineDocumentText className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Applications</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{overview?.applications || 0}</h3>
          <p className="mt-2 text-sm text-slate-600">Pipeline visibility and status updates.</p>
        </div>
        <div className={`${panelClass} group p-5 lg:min-h-[200px] lg:bg-gradient-to-br lg:from-violet-50 lg:to-indigo-50`}>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <HiOutlineShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Admins</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{overview?.admins || 0}</h3>
          <p className="mt-2 text-sm text-slate-600">Elevated access and governance controls.</p>
        </div>
      </div>

      <div className={`${panelClass} overflow-x-auto border-blue-100/80 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/35 p-5`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">User Management</h2>
            <p className="mt-1 text-sm text-slate-500">Adjust roles, account state, and password security.</p>
          </div>
          <span className={chipClass}>{users.length} users</span>
        </div>
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className={`${tableHeaderClass} bg-blue-100/70 text-blue-900`}>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Security</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={userTableRowClass}>
                <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                <td className="p-3 text-slate-600">{u.email}</td>
                <td className="p-3">
                  <select className={selectClass} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                    <option value="seeker" disabled={currentUser?.id === u.id}>seeker</option>
                    <option value="employer" disabled={currentUser?.id === u.id}>employer</option>
                    <option value="admin">admin</option>
                  </select>
                  {currentUser?.id === u.id ? (
                    <p className="mt-2 text-xs font-medium text-blue-700">You cannot remove your own admin role.</p>
                  ) : null}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => handleSecurityUpdate(u.id, { isActive: !(u.isActive !== false) })} className={`rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${(u.isActive !== false) ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                      <span className="inline-flex items-center gap-1.5">
                        <HiOutlineLockClosed className="h-4 w-4" />
                        {(u.isActive !== false) ? 'Disable' : 'Enable'}
                      </span>
                    </button>
                    <button onClick={() => handleSecurityUpdate(u.id, { unlock: true })} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
                      <span className="inline-flex items-center gap-1.5">
                        <HiOutlineShieldCheck className="h-4 w-4" />
                        Unlock
                      </span>
                    </button>
                    <input
                      type="password"
                      placeholder="New pass"
                      value={passwordDrafts[u.id] || ''}
                      onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      className={inputClass}
                    />
                    <button onClick={() => handleSecurityUpdate(u.id, { newPassword: passwordDrafts[u.id] || '' })} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md">
                      <span className="inline-flex items-center gap-1.5">
                        <HiOutlineKey className="h-4 w-4" />
                        Reset Pass
                      </span>
                    </button>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {(u.isActive !== false) ? 'active' : 'disabled'} | tries: {u.failedLoginAttempts || 0}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      pendingDelete.type === 'user' && pendingDelete.id === u.id ? 'bg-rose-800' : 'bg-rose-600'
                    }`}
                  >
                    {pendingDelete.type === 'user' && pendingDelete.id === u.id ? 'Confirm Delete' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${panelClass} overflow-x-auto border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/35 p-5`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Jobs Management</h2>
            <p className="mt-1 text-sm text-slate-500">Review published roles and remove invalid listings.</p>
          </div>
          <span className={chipClass}>{jobs.length} jobs</span>
        </div>
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr className={`${tableHeaderClass} bg-emerald-100/70 text-emerald-900`}><th className="p-3">Title</th><th className="p-3">Company</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className={jobsTableRowClass}>
                <td className="p-3 font-semibold text-slate-800">{j.title}</td>
                <td className="p-3 text-slate-600">{j.company}</td>
                <td className="p-3"><span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{j.status}</span></td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteJob(j.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      pendingDelete.type === 'job' && pendingDelete.id === j.id ? 'bg-rose-800' : 'bg-rose-600'
                    }`}
                  >
                    {pendingDelete.type === 'job' && pendingDelete.id === j.id ? 'Confirm Delete' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${panelClass} overflow-x-auto border-amber-100/80 bg-gradient-to-br from-white via-amber-50/25 to-orange-50/35 p-5`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Applications Overview</h2>
            <p className="mt-1 text-sm text-slate-500">Track application pipeline health and intervene when needed.</p>
          </div>
          <span className={chipClass}>{applications.length} applications</span>
        </div>
        <table className="w-full min-w-[980px] text-sm">
          <thead><tr className={`${tableHeaderClass} bg-amber-100/80 text-amber-900`}><th className="p-3">Seeker</th><th className="p-3">Job</th><th className="p-3">Company</th><th className="p-3">Status</th><th className="p-3">Edit</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {applications.slice(0, 50).map((a) => (
              <tr key={a.id} className={applicationsTableRowClass}>
                <td className="p-3 text-slate-700">{a.seekerName}</td>
                <td className="p-3 text-slate-700">{a.jobTitle}</td>
                <td className="p-3 text-slate-700">{a.company}</td>
                <td className="p-3"><span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{a.status}</span></td>
                <td className="p-3">
                  <select className={selectClass} value={a.status || 'Pending'} onChange={(e) => handleApplicationStatus(a.id, e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Review">Review</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteApplication(a.id)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      pendingDelete.type === 'application' && pendingDelete.id === a.id ? 'bg-rose-800' : 'bg-rose-600'
                    }`}
                  >
                    {pendingDelete.type === 'application' && pendingDelete.id === a.id ? 'Confirm Delete' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes adminToastIn {
          0% {
            opacity: 0;
            transform: translateX(72px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes adminToastOut {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(72px) scale(0.94);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
