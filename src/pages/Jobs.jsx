import React, { useMemo, useState, useEffect } from 'react';
import { deleteJob, getJobs, updateJob } from '../services/jobService';
import JobCard from '../components/JobCard';
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowTrendingUp,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentList,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineSparkles,
  HiOutlineGlobeAlt ,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import StatusAlert from '../components/StatusAlert';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [adminState, setAdminState] = useState({});
  const [pendingDeleteJobId, setPendingDeleteJobId] = useState('');
  const panelClass = 'rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.88))] shadow-[var(--shadow-soft)] transition duration-300 hover:shadow-[var(--shadow-hover)]';
  const statCardClass = 'rounded-[24px] border p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md';
  const insightCardClass = 'rounded-[24px] border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getJobs();
        setJobs(data);
        setLoadError('');
      } catch (error) {
        setLoadError(error?.response?.data?.message || 'Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const jobTypes = useMemo(() => {
    const set = new Set((jobs || []).map((job) => job.type).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (jobs || []).filter((job) => {
      const matchesText =
        !q ||
        String(job.title || '').toLowerCase().includes(q) ||
        String(job.company || '').toLowerCase().includes(q) ||
        String(job.location || '').toLowerCase().includes(q);
      const matchesType = typeFilter === 'All' || job.type === typeFilter;
      return matchesText && matchesType;
    });
  }, [jobs, search, typeFilter]);

  const companyCount = useMemo(() => new Set((jobs || []).map((job) => job.company).filter(Boolean)).size, [jobs]);
  const remoteCount = useMemo(() => filteredJobs.filter((job) => String(job.location || '').toLowerCase().includes('remote')).length, [filteredJobs]);
  const topSalaryCount = useMemo(() => filteredJobs.filter((job) => String(job.salary || '').trim()).length, [filteredJobs]);

  const featuredJob = filteredJobs[0] || jobs[0] || null;

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
        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(120deg,_rgba(30,64,175,0.96),_rgba(37,99,235,0.92)_48%,_rgba(14,165,233,0.78)_100%)] p-5 shadow-sm transition duration-300 hover:shadow-[0_24px_55px_rgba(37,99,235,0.10)] md:p-6">
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                <HiOutlineSparkles className="h-4 w-4" />
                Browse Jobs
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Explore roles faster
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white md:text-base">
                A more compact job browsing layout focused on search, comparison, and quick review.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/40 bg-white/85 p-4 backdrop-blur">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                <div className={`${statCardClass} border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-200`}>
                  <HiOutlineClipboardDocumentList className="mb-3 h-5 w-5 text-blue-700" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Listings</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{filteredJobs.length}</p>
                </div>
                <div className={`${statCardClass} border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 hover:border-indigo-200`}>
                  <HiOutlineBuildingOffice2 className="mb-3 h-5 w-5 text-indigo-700" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Companies</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{companyCount}</p>
                </div>
                <div className={`${statCardClass} border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:border-violet-200`}>
                  <HiOutlineGlobeAlt className="mb-3 h-5 w-5 text-violet-700" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">Remote</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{remoteCount}</p>
                </div>
                <div className={`${statCardClass} border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-200`}>
                  <HiOutlineCurrencyDollar className="mb-3 h-5 w-5 text-emerald-700" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">Salary</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{topSalaryCount}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <StatusAlert message={loadError} variant="error" onClose={() => setLoadError('')} />


        <section className="grid gap-4 md:grid-cols-3">
          <article className={`${insightCardClass} border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-200`}>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <HiOutlineSparkles className="h-6 w-6" />
            </span>
            <div className="mt-4">
              <h3 className="text-base font-black text-slate-950">Smart Match</h3>
              <p className="mt-2 text-sm text-slate-600">Use the catalog to quickly spot jobs that align with your background.</p>
            </div>
          </article>
          <article className={`${insightCardClass} border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-200`}>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <HiOutlineClipboardDocumentList className="h-6 w-6" />
            </span>
            <div className="mt-4">
              <h3 className="text-base font-black text-slate-950">Application Tracking</h3>
              <p className="mt-2 text-sm text-slate-600">Move from browsing to applying with a clearer job shortlist experience.</p>
            </div>
          </article>
          <article className={`${insightCardClass} border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-200`}>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <HiOutlineArrowTrendingUp className="h-6 w-6" />
            </span>
            <div className="mt-4">
              <h3 className="text-base font-black text-slate-950">Interview Pipeline</h3>
              <p className="mt-2 text-sm text-slate-600">Understand the path ahead before you decide which openings deserve attention.</p>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className={`${panelClass} p-5`}>
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <HiOutlineAdjustmentsHorizontal className="h-5 w-5 text-blue-700" />
              Refine Results
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, company, location..."
                  className="pl-12"
                />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={`${statCardClass} border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-200`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Active</p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {filteredJobs.filter((job) => String(job.status || 'Active') === 'Active').length}
              </p>
            </div>
            <div className={`${statCardClass} border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-200`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">Hybrid</p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {filteredJobs.filter((job) => String(job.location || '').toLowerCase().includes('hybrid')).length}
              </p>
            </div>
            <div className={`${statCardClass} border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 hover:border-violet-200`}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-700">Growth</p>
              <p className="mt-2 inline-flex items-center gap-1 text-3xl font-black text-slate-950">
                <HiOutlineArrowTrendingUp className="h-6 w-6 text-blue-700" />
                {Math.min(filteredJobs.length, 99)}
              </p>
            </div>
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Job Catalog</h2>
              <p className="mt-1 text-sm text-slate-500">A cleaner browse experience with cards designed for quick comparison.</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 md:inline-flex">
              <HiOutlineBuildingOffice2 className="h-4 w-4 text-blue-700" />
              {companyCount} companies
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <article key={index} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-2/3 rounded bg-slate-200" />
                        <div className="h-4 w-1/2 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-16 rounded bg-slate-200" />
                    <div className="h-10 rounded-xl bg-slate-200" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isAdmin={user?.role === 'admin'}
                  adminState={adminState[job.id]}
                  onAdminStatusChange={handleAdminStatus}
                  onAdminDelete={handleAdminDelete}
                />
              ))}
            </div>
          )}

          {!loading && filteredJobs.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No jobs match your search or selected filter.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default Jobs;
