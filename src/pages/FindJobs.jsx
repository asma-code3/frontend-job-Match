import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteJob, getJobs, updateJob } from '../services/jobService';
import { createApplication, getApplications } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/profileStorage';
import { HiOutlineAdjustmentsHorizontal, HiOutlineArrowTrendingUp, HiOutlineBuildingOffice2, HiOutlineMapPin, HiOutlineMagnifyingGlass, HiOutlineSparkles } from 'react-icons/hi2';
import StatusAlert from '../components/StatusAlert';

const FindJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [applyState, setApplyState] = useState({});
  const [adminState, setAdminState] = useState({});
  const [pendingDeleteJobId, setPendingDeleteJobId] = useState('');
  const [applyModal, setApplyModal] = useState({ open: false, job: null });
  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '', location: '' });
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const panelClass = 'overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.88))] shadow-[var(--shadow-soft)]';
  const statCardClass = 'rounded-2xl border p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md';
  const actionButtonClass = 'rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300';

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const data = await getJobs();
        setJobs(data);
      } catch (error) {
        setLoadError(error?.response?.data?.message || 'Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const loadMyApplications = async () => {
      if (!user?.email) return;
      try {
        const apps = await getApplications(user.email);
        setAppliedJobIds(new Set((apps || []).map((a) => a.jobId)));
      } catch {
        setAppliedJobIds(new Set());
      }
    };
    loadMyApplications();
  }, [user?.email]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200 ring-1 ring-green-600/10';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-1 ring-yellow-600/10';
    return 'bg-red-100 text-red-700 border-red-200 ring-1 ring-red-600/10';
  };

  const sortedJobs = [...filteredJobs].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  const featuredJobs = sortedJobs.filter((job) => (job.matchScore || 0) >= 80).length;
  const remoteFriendlyJobs = sortedJobs.filter((job) => String(job.location || '').toLowerCase().includes('remote')).length;
  const activeJobs = sortedJobs.filter((job) => String(job.status || 'Active') === 'Active').length;

  const handleApply = async (job) => {
    if (appliedJobIds.has(job.id)) {
      setApplyState((prev) => ({
        ...prev,
        [job.id]: { type: 'error', text: 'You have already applied for this job.' },
      }));
      return;
    }
    if (!user?.email) {
      setApplyState((prev) => ({
        ...prev,
        [job.id]: { type: 'error', text: 'Please login to the system first before applying.' },
      }));
      navigate('/login');
      return;
    }
    const profile = getProfile(user.email, user);
    setApplyForm({
      name: profile?.form?.name || user?.name || '',
      email: profile?.form?.email || user?.email || '',
      phone: profile?.form?.phone || '',
      location: profile?.form?.location || '',
    });
    setApplyModal({ open: true, job });
  };

  const submitApply = async () => {
    const job = applyModal.job;
    if (!job) return;
    if (!applyForm.name.trim() || !applyForm.email.trim() || !applyForm.phone.trim() || !applyForm.location.trim()) {
      setApplyState((prev) => ({ ...prev, [job.id]: { type: 'error', text: 'Name, email, phone, and location are required.' } }));
      return;
    }
    setApplyState((prev) => ({ ...prev, [job.id]: { type: 'loading', text: 'Applying...' } }));
    try {
      const profile = getProfile(user.email, user);
      await createApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        seekerName: applyForm.name.trim(),
        seekerPhone: applyForm.phone.trim(),
        seekerLocation: applyForm.location.trim(),
        seekerProfile: {
          name: applyForm.name.trim(),
          email: applyForm.email.trim(),
          phone: applyForm.phone.trim(),
          location: applyForm.location.trim(),
          title: profile?.form?.title || '',
          skills: profile?.form?.skills || '',
          bio: profile?.form?.bio || '',
        },
        cvUrl: profile?.cvPreview?.url || '',
        cvFileName: profile?.cvPreview?.name || '',
        seekerTitle: profile?.form?.title || '',
        seekerSkills: profile?.form?.skills || '',
        seekerBio: profile?.form?.bio || '',
        certificates: Array.isArray(profile?.certificates) ? profile.certificates : [],
      });
      setApplyModal({ open: false, job: null });
      setAppliedJobIds((prev) => new Set([...prev, job.id]));
      setApplyState((prev) => ({ ...prev, [job.id]: { type: 'success', text: 'Applied successfully.' } }));
    } catch (error) {
      const backendMsg = error?.response?.data?.message;
      const text = error?.response?.status === 409 ? 'You have already applied for this job.' : (backendMsg || 'Apply failed. Try again.');
      setApplyState((prev) => ({ ...prev, [job.id]: { type: 'error', text } }));
    }
  };

  const handleAdminStatus = async (jobId, status) => {
    setAdminState((prev) => ({ ...prev, [jobId]: { type: 'loading', text: 'Updating...' } }));
    try {
      await updateJob(jobId, { status });
      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status } : job)));
      setAdminState((prev) => ({ ...prev, [jobId]: { type: 'success', text: 'Status updated.' } }));
    } catch (error) {
      setAdminState((prev) => ({ ...prev, [jobId]: { type: 'error', text: error?.response?.data?.message || 'Update failed.' } }));
    }
  };

  const handleAdminDelete = async (jobId) => {
    if (pendingDeleteJobId !== jobId) {
      setPendingDeleteJobId(jobId);
      setAdminState((prev) => ({ ...prev, [jobId]: { type: 'error', text: 'Click delete again to confirm.' } }));
      return;
    }
    setAdminState((prev) => ({ ...prev, [jobId]: { type: 'loading', text: 'Deleting...' } }));
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      setPendingDeleteJobId('');
    } catch (error) {
      setAdminState((prev) => ({ ...prev, [jobId]: { type: 'error', text: error?.response?.data?.message || 'Delete failed.' } }));
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-sky-200 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.24),_transparent_32%),linear-gradient(120deg,_rgba(30,64,175,0.96),_rgba(37,99,235,0.92)_48%,_rgba(14,165,233,0.78)_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 p-5 md:grid-cols-[1.3fr_0.8fr] md:p-7">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-50">
                <HiOutlineSparkles className="h-4 w-4" />
                Smart Job Browser
              </div>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white md:text-5xl">
                  Browse roles that actually fit your next move
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-blue-50/90 md:text-base">
                  Search faster, compare fit scores, and jump into the strongest opportunities without getting lost in clutter.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <article className={`${statCardClass} border-white/20 bg-white/12 backdrop-blur`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-50/80">Live Roles</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{activeJobs}</p>
                </article>
                <article className={`${statCardClass} border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Top Matches</p>
                  <p className="mt-2 text-3xl font-black text-emerald-800">{featuredJobs}</p>
                </article>
                <article className={`${statCardClass} border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">Remote Friendly</p>
                  <p className="mt-2 text-3xl font-black text-violet-800">{remoteFriendlyJobs}</p>
                </article>
              </div>
            </div>
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                  alt="Person searching for a job opportunity"
                  className="h-52 w-full object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search</p>
                  <p className="mt-1 font-bold text-slate-900">Title + company</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compare</p>
                  <p className="mt-1 font-bold text-slate-900">Fit score first</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={panelClass}>
          <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <HiOutlineAdjustmentsHorizontal className="h-5 w-5 text-sky-700" />
                Refine your search
              </div>
              <div className="relative">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input 
              type="text" 
              placeholder="Search by job title, keyword, or company" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
              <div className={`${statCardClass} border-slate-100 bg-slate-50 p-3 text-center`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Results</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{sortedJobs.length}</p>
              </div>
              <div className={`${statCardClass} border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-3 text-center`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Best Fit</p>
                <p className="mt-1 text-2xl font-black text-sky-800">{sortedJobs[0]?.matchScore || 0}%</p>
              </div>
              <div className={`${statCardClass} border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-3 text-center`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Applied</p>
                <p className="mt-1 text-2xl font-black text-amber-800">{appliedJobIds.size}</p>
              </div>
            </div>
          </div>
        </section>

        <StatusAlert
          message={loadError}
          variant="error"
          onClose={() => setLoadError('')}
          floating
          className="top-5 right-5 min-w-[280px] max-w-sm"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-6 w-24 rounded-full bg-slate-200" />
                      <div className="h-4 w-16 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <div className="h-7 w-3/4 rounded bg-slate-200" />
                  <div className="h-5 w-1/2 rounded bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                  </div>
                  <div className="h-10 rounded-xl bg-slate-200" />
                  <div className="h-10 rounded-xl bg-slate-200" />
                </div>
              </article>
            ))
          ) : sortedJobs.length > 0 ? (
            sortedJobs.map(job => (
              <article key={job.id} className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,251,255,0.92))] p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_16px_40px_rgba(14,116,144,0.12)]">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-xl font-black text-blue-800 shadow-sm">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${getMatchColor(job.matchScore)}`}>
                      <HiOutlineArrowTrendingUp className="h-3.5 w-3.5" />
                      <span>{job.matchScore}% Match</span>
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {job.type || 'Role'}
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="mb-1 text-xl font-black text-slate-900 transition-colors group-hover:text-sky-700">{job.title}</h3>
                  <p className="inline-flex items-center gap-2 font-semibold text-sky-700">
                    <HiOutlineBuildingOffice2 className="h-4 w-4" />
                    {job.company}
                  </p>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {job.status || 'Active'}
                  </span>
                  {String(job.location || '').toLowerCase().includes('remote') ? (
                    <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      Remote friendly
                    </span>
                  ) : null}
                </div>

                <div className="mb-6 flex-1 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <HiOutlineMapPin className="h-4 w-4 text-slate-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.salary}
                  </div>
                  {job.description ? (
                    <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                      {job.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
                  {user?.role === 'admin' ? (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Admin Controls</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={job.status || 'Active'}
                          onChange={(e) => handleAdminStatus(job.id, e.target.value)}
                          className="min-h-[36px] text-xs"
                        >
                          <option value="Active">Active</option>
                          <option value="Paused">Paused</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button
                          onClick={() => handleAdminDelete(job.id)}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                      {adminState[job.id]?.text ? (
                        <p className={`mt-2 text-xs ${adminState[job.id].type === 'error' ? 'text-rose-600' : 'text-blue-700'}`}>
                          {adminState[job.id].text}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    onClick={() => handleApply(job)}
                    disabled={applyState[job.id]?.type === 'loading' || appliedJobIds.has(job.id)}
                    className={`block w-full ${actionButtonClass} ${
                      appliedJobIds.has(job.id)
                        ? 'cursor-not-allowed bg-slate-200 text-slate-600'
                        : 'bg-gradient-to-r from-[var(--brand-800)] via-[var(--brand-700)] to-[var(--accent-500)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:brightness-105'
                    }`}
                  >
                    {applyState[job.id]?.type === 'loading' ? 'Applying...' : appliedJobIds.has(job.id) ? 'Already Applied' : 'Apply'}
                  </button>
                  <Link
                    to={`/job/${job.id}`}
                    className="block w-full rounded-xl border border-[var(--line-soft)] bg-white py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-[var(--line-strong)] hover:bg-slate-50"
                  >
                    View Details
                  </Link>
                  {applyState[job.id]?.text ? (
                    <p className={`text-xs ${applyState[job.id].type === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {applyState[job.id].text}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-1 rounded-[26px] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.82))] py-16 text-center md:col-span-3">
              <p className="text-lg font-semibold text-slate-700">No jobs found matching "{search}".</p>
              <p className="mt-2 text-sm text-slate-500">Try another keyword, company name, or shorter search.</p>
            </div>
          )}
        </div>
      </div>
      {applyModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setApplyModal({ open: false, job: null })}>
          <div className="w-full max-w-md rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92))] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Quick Apply</h3>
            <p className="mb-3 text-sm text-slate-600">{applyModal.job?.title}</p>
            <div className="space-y-3">
              <input value={applyForm.name} onChange={(e) => setApplyForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="rounded-2xl" />
              <input value={applyForm.email} onChange={(e) => setApplyForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" type="email" className="rounded-2xl" />
              <input value={applyForm.phone} onChange={(e) => setApplyForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className="rounded-2xl" />
              <input value={applyForm.location} onChange={(e) => setApplyForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="rounded-2xl" />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn-secondary px-4" onClick={() => setApplyModal({ open: false, job: null })}>Cancel</button>
              <button className="btn-primary px-4" onClick={submitApply}>Submit Apply</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FindJobs;
