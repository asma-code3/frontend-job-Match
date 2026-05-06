import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSeekerDashboard } from '../services/dashboardService';
import { getApplications } from '../services/applicationService';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineUserCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ topMatches: [], recommendedJobs: [], stats: { applications: 0, interviews: 0, savedJobs: 0 } });
  const [recentApplications, setRecentApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStatusPill = (status) => {
    switch (status) {
      case 'Hired':
        return { className: 'bg-emerald-100 text-emerald-800', Icon: HiOutlineCheckBadge };
      case 'Interview':
        return { className: 'bg-indigo-100 text-indigo-800', Icon: HiOutlineArrowTrendingUp };
      case 'Rejected':
        return { className: 'bg-rose-100 text-rose-800', Icon: HiOutlineXCircle };
      default:
        return { className: 'bg-blue-100 text-blue-800', Icon: HiOutlineClock };
    }
  };

  const topMatchRate = useMemo(() => {
    const scores = (data.topMatches || []).map((job) => Number(job.matchScore || 0));
    if (!scores.length) return 0;
    return Math.round(Math.max(...scores));
  }, [data.topMatches]);

  const recentApplicationSummary = useMemo(() => {
    const byStatus = (status) => allApplications.filter((item) => item.status === status).length;
    return {
      pending: byStatus('Pending'),
      interview: byStatus('Interview'),
      hired: byStatus('Hired'),
      rejected: byStatus('Rejected'),
    };
  }, [allApplications]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashboard, apps] = await Promise.all([
          getSeekerDashboard(user?.email || ''),
          user?.email ? getApplications(user.email) : Promise.resolve([]),
        ]);
        setData(dashboard);
        setAllApplications(apps || []);
        setRecentApplications((apps || []).slice(0, 5));
        setError('');
      } catch (loadError) {
        console.error('Failed to load seeker dashboard', loadError);
        setError(loadError?.response?.data?.message || 'Failed to load seeker dashboard.');
        setAllApplications([]);
        setRecentApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.email]);

  const primaryStats = [
    {
      label: 'Applications',
      value: data.stats.applications,
      note: 'Roles you have already applied for',
      icon: HiOutlineClipboardDocumentList,
      shell: 'bg-blue-100 text-blue-700',
      bar: 'from-blue-700 to-sky-500',
    },
    {
      label: 'Interviews',
      value: data.stats.interviews,
      note: 'Applications that moved to interview stage',
      icon: HiOutlineArrowTrendingUp,
      shell: 'bg-indigo-100 text-indigo-700',
      bar: 'from-indigo-700 to-blue-500',
    },
    {
      label: 'Top Matches',
      value: data.topMatches.length,
      note: 'Best matching opportunities available now',
      icon: HiOutlineSparkles,
      shell: 'bg-sky-100 text-sky-700',
      bar: 'from-sky-700 to-cyan-500',
    },
    {
      label: 'Best Match',
      value: `${topMatchRate}%`,
      note: 'Highest current match score from your top roles',
      icon: HiOutlineBriefcase,
      shell: 'bg-emerald-100 text-emerald-700',
      bar: 'from-emerald-600 to-sky-600',
    },
  ];

  const renderJobCard = (job, mode = 'match') => (
    <article
      key={job.id}
      className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,251,255,0.94))] p-4 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:ring-blue-200 hover:shadow-[0_18px_38px_rgba(37,99,235,0.14)] sm:min-h-[250px] sm:p-5"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_32%)]" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-black leading-snug text-slate-900 transition-colors duration-300 group-hover:text-blue-800">{job.title}</h3>
          <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <HiOutlineBuildingOffice2 className="h-4 w-4 text-blue-700" />
            {job.company}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200 transition duration-300 group-hover:bg-blue-700 group-hover:text-white group-hover:ring-blue-700">
          {job.matchScore || 0}% Match
        </span>
      </div>
      <div className="relative mt-4 flex flex-wrap gap-2">
        {job.location ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{job.location}</span> : null}
        {job.type ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">{job.type}</span> : null}
        {mode === 'match' ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Top opportunity</span> : null}
      </div>
      <Link
        to={`/job/${job.id}`}
        className="relative mt-auto inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 pt-3 text-sm font-semibold text-blue-700 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 group-hover:shadow-[0_10px_24px_rgba(37,99,235,0.10)]"
      >
        View details
      </Link>
    </article>
  );

  return (
    <div className="page-shell">
      <div className="page-container space-y-6">
        <section className="hero-panel px-4 py-5 sm:px-6 sm:py-7">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-5">
              <p className="hero-kicker">
                <HiOutlineSparkles className="h-4 w-4" />
                Seeker Dashboard
              </p>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  Welcome back, {user?.name || 'User'}
                </h1>
                <p className="max-w-2xl text-sm text-blue-50/95 md:text-base">
                  Track your applications, discover strong matches, and keep your next career move organized from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/find-jobs" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 transition">
                  Find Jobs
                </Link>
                <Link to="/applications" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition">
                  Track Applications
                </Link>
              </div>
              {error ? (
                <p className="max-w-xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="rounded-[26px] border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/12 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Applications</p>
                  <p className="mt-2 text-3xl font-black text-white">{data.stats.applications}</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Best Match</p>
                  <p className="mt-2 text-3xl font-black text-white">{topMatchRate}%</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Quick Actions</p>
                    <p className="mt-1 text-sm text-blue-50">Keep your search active and your profile ready.</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/14 text-white">
                    <HiOutlineUserCircle className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  <Link to="/profile" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 transition">
                    Update My Profile
                  </Link>
                  <Link to="/jobs" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition">
                    Browse Public Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryStats.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="surface-card  p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4 hover:to-blue-300 ">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{item.label}</p>
                    <p className="mt-3 text-3xl font-black text-slate-900">{item.value}</p>
                  </div>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.shell}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${item.bar}`} />
                <p className="mt-3 text-sm text-slate-500">{item.note}</p>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.45fr]">
          <div className="surface-card p-5 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Application Snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">Your most recent application outcomes at a glance.</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <HiOutlineClipboardDocumentList className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 ">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-800">Pending</p>
                <p className="mt-2 text-3xl font-black text-blue-800">{recentApplicationSummary.pending}</p>
              </div>
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-800">Interview</p>
                <p className="mt-2 text-3xl font-black text-indigo-800">{recentApplicationSummary.interview}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Hired</p>
                <p className="mt-2 text-3xl font-black text-emerald-800">{recentApplicationSummary.hired}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-blue-400">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-800">Rejected</p>
                <p className="mt-2 text-3xl font-black text-rose-800">{recentApplicationSummary.rejected}</p>
              </div>
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-900">
                  <HiOutlineClipboardDocumentList className="h-5 w-5 text-blue-700" />
                  Recent Applications
                </h2>
                <p className="mt-1 text-sm text-slate-500">The latest roles you applied to and where they stand.</p>
              </div>
              <Link to="/applications" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                View all
              </Link>
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              {loading ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Loading seeker dashboard...
                </p>
              ) : null}
              {!loading && recentApplications.map((app) => {
                const statusMeta = getStatusPill(app.status || 'Pending');
                return (
                  <article key={app.id} className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_32px_rgba(37,99,235,0.12)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{app.jobTitle || '-'}</h3>
                        <p className="mt-1 text-sm text-slate-500">{app.company || '-'} • {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}>
                        <statusMeta.Icon className="h-3.5 w-3.5" />
                        {app.status || 'Pending'}
                      </span>
                    </div>
                  </article>
                );
              })}
              {!loading && recentApplications.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No applications yet.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2 items-stretch">
          <div className="surface-card p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-900">
                  <HiOutlineSparkles className="h-5 w-5 text-blue-700" />
                  Top Matches
                </h2>
                <p className="mt-1 text-sm text-slate-500">Roles with the strongest fit for your profile.</p>
              </div>
              <Link to="/find-jobs" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.topMatches.map((job) => renderJobCard(job, 'match'))}
              {data.topMatches.length === 0 ? <p className="text-sm text-slate-500">No matches yet.</p> : null}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-900">
                  <HiOutlineBriefcase className="h-5 w-5 text-blue-700" />
                  Recommended Jobs
                </h2>
                <p className="mt-1 text-sm text-slate-500">Additional opportunities worth reviewing next.</p>
              </div>
              <Link to="/jobs" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                Browse jobs
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.recommendedJobs.map((job) => renderJobCard(job, 'recommended'))}
              {data.recommendedJobs.length === 0 ? <p className="text-sm text-slate-500">No recommendations yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SeekerDashboard;
