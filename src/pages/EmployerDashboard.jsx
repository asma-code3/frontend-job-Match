import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmployerDashboard } from '../services/dashboardService';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineXCircle,
} from 'react-icons/hi2';

const EmployerDashboard = () => {
  const [data, setData] = useState({ activeJobs: 0, totalApplicants: 0, interviews: 0, recentApplicants: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const insights = useMemo(() => {
    const list = data?.recentApplicants || [];
    const byStatus = (status) => list.filter((item) => item.status === status).length;
    return {
      hired: byStatus('Hired'),
      interview: byStatus('Interview'),
      pending: byStatus('Pending'),
      rejected: byStatus('Rejected'),
    };
  }, [data?.recentApplicants]);

  const conversionRate = data.totalApplicants > 0 ? Math.round((insights.hired / data.totalApplicants) * 100) : 0;

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Hired':
        return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
      case 'Interview':
        return 'bg-indigo-100 text-indigo-800 ring-indigo-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 ring-rose-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 ring-blue-200';
      default:
        return 'bg-sky-100 text-sky-800 ring-sky-200';
    }
  };

  const primaryStats = [
    {
      label: 'Active Jobs',
      value: data.activeJobs,
      note: 'Open roles currently visible to candidates',
      icon: HiOutlineBriefcase,
      accent: 'from-blue-700 to-sky-500',
      iconShell: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Total Applicants',
      value: data.totalApplicants,
      note: 'Candidates currently in your hiring pipeline',
      icon: HiOutlineUsers,
      accent: 'from-sky-700 to-cyan-500',
      iconShell: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Interviews',
      value: data.interviews,
      note: 'Applicants moved into interview stage',
      icon: HiOutlineCalendarDays,
      accent: 'from-indigo-700 to-blue-500',
      iconShell: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Hire Rate',
      value: `${conversionRate}%`,
      note: 'Hired applicants compared to total applicants',
      icon: HiOutlineArrowTrendingUp,
      accent: 'from-emerald-600 to-sky-600',
      iconShell: 'bg-emerald-100 text-emerald-700',
    },
  ];

  const pipelineCards = [
    {
      key: 'pending',
      label: 'Pending Review',
      value: insights.pending,
      icon: HiOutlineClock,
      shell: 'border-blue-200 bg-blue-50',
      text: 'text-blue-800',
      iconShell: 'bg-white text-blue-700',
    },
    {
      key: 'interview',
      label: 'Interviewing',
      value: insights.interview,
      icon: HiOutlineSparkles,
      shell: 'border-indigo-200 bg-indigo-50',
      text: 'text-indigo-800',
      iconShell: 'bg-white text-indigo-700',
    },
    {
      key: 'hired',
      label: 'Hired',
      value: insights.hired,
      icon: HiOutlineCheckBadge,
      shell: 'border-emerald-200 bg-emerald-50',
      text: 'text-emerald-800',
      iconShell: 'bg-white text-emerald-700',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      value: insights.rejected,
      icon: HiOutlineXCircle,
      shell: 'border-rose-200 bg-rose-50',
      text: 'text-rose-800',
      iconShell: 'bg-white text-rose-700',
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await getEmployerDashboard();
        setData(result);
        setError('');
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Failed to load employer dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="page-shell">
      <div className="page-container space-y-6">
        <section className="hero-panel">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-5">
              <p className="hero-kicker">
                <HiOutlineClipboardDocumentList className="h-4 w-4" />
                Employer Dashboard
              </p>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
                  Run your hiring pipeline with clarity and speed
                </h1>
                <p className="max-w-2xl text-sm text-blue-50/95 md:text-base">
                  Track open roles, review candidate flow, and keep interviews moving from a single professional workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/post-job" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 hover:text-blue-900">
                  Post New Job
                </Link>
                <Link to="/applicants" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 hover:text-white">
                  Review Applicants
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
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Applicants This View</p>
                  <p className="mt-2 text-3xl font-black text-white">{data.totalApplicants}</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Hire Rate</p>
                  <p className="mt-2 text-3xl font-black text-white">{conversionRate}%</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Quick Actions</p>
                    <p className="mt-1 text-sm text-blue-50">Stay on top of your next hiring steps.</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/14 text-white">
                    <HiOutlinePlus className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  <Link to="/manage-jobs" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 hover:text-blue-900">
                    Manage Open Jobs
                  </Link>
                  <Link to="/company-settings" className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 hover:text-white">
                    Update Company Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-x-auto pb-2">
          <div className="grid min-w-[1080px] grid-cols-4 gap-4">
            {primaryStats.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className="surface-card flex h-full min-h-[220px] flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-3 text-3xl font-black text-slate-900">{item.value}</p>
                    </div>
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconShell}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${item.accent}`} />
                  <p className="mt-3 text-sm leading-6 text-slate-500">{item.note}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.45fr]">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Pipeline Snapshot</h2>
                <p className="mt-1 text-sm text-slate-500">See how recent candidates are moving through your funnel.</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <HiOutlineSparkles className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pipelineCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className={`rounded-2xl border p-4 ${item.shell}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-[0.16em] ${item.text}`}>{item.label}</p>
                        <p className={`mt-2 text-3xl font-black ${item.text}`}>{item.value}</p>
                      </div>
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconShell}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-900">
                  <HiOutlineUsers className="h-5 w-5 text-blue-700" />
                  Recent Applicants
                </h2>
                <p className="mt-1 text-sm text-slate-500">Latest people who entered your hiring pipeline.</p>
              </div>
              <Link to="/applicants" className="text-sm font-semibold text-blue-700 hover:text-blue-700">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Candidate</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Job Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                        Loading employer dashboard...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && data.recentApplicants.map((app, index) => (
                    <tr key={app.id} className={`transition hover:bg-blue-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <HiOutlineUserCircle className="h-5 w-5" />
                          </span>
                          {app.seekerName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{app?.seekerProfile?.phone || app?.seekerPhone || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{app.jobTitle}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}

                  {!loading && data.recentApplicants.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                        No applicants yet. Post a role to start building your pipeline.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployerDashboard;
