import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdWork, MdLocationOn, MdDelete, MdSearch } from 'react-icons/md';
import { BsPeopleFill, BsCalendarCheck } from 'react-icons/bs';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { getJobs } from '../services/jobService';
import { getApplicants } from '../services/applicationService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusAlert from '../components/StatusAlert';

const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    const rawNotice = sessionStorage.getItem('jobmatch_manage_jobs_notice');
    if (!rawNotice) return;

    try {
      const notice = JSON.parse(rawNotice);
      setMessage(notice?.message || '');
      setMessageType(notice?.type || 'success');
    } catch {
      setMessage('');
      setMessageType('success');
    } finally {
      sessionStorage.removeItem('jobmatch_manage_jobs_notice');
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      try {
        const data = await getJobs();
        const mine = (data || []).filter((job) => job.postedBy === user?.id);
        if (!active) return;
        setJobs(mine);
      } catch (error) {
        console.error('Failed to load jobs', error);
      }
    };

    const loadApplicants = async () => {
      try {
        const data = await getApplicants();
        const grouped = (data || []).reduce((acc, app) => {
          const key = app.jobId;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        if (!active) return;
        setApplicantsByJob(grouped);
      } catch (error) {
        console.error('Failed to load applicants count', error);
      }
    };

    const refreshAll = () => {
      loadJobs();
      loadApplicants();
    };

    if (user?.id) {
      refreshAll();
    }

    const handleWindowFocus = () => {
      if (user?.id) {
        refreshAll();
      }
    };

    const refreshTimer = user?.id ? window.setInterval(refreshAll, 15000) : null;
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      active = false;
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user?.id]);

  const activeJobs = useMemo(() => jobs.filter((job) => job.status === 'Active').length, [jobs]);
  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesText =
        !q ||
        String(job.title || '').toLowerCase().includes(q) ||
        String(job.company || '').toLowerCase().includes(q) ||
        String(job.location || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || String(job.status || 'Active') === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((job) => job.id !== id));
    } catch (error) {
      console.error('Failed to delete job', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'Closed':
        return 'bg-rose-100 text-rose-700 ring-rose-600/10';
      case 'Paused':
        return 'bg-amber-100 text-amber-700 ring-amber-600/10';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container space-y-8">
        <StatusAlert
          message={message}
          variant={messageType}
          onClose={() => setMessage('')}
          autoHide={messageType === 'success'}
          duration={120000}
          floating
          className="right-6 top-6"
        />
        <div className="hero-panel">
          <p className="hero-kicker">
            <HiOutlineClipboardDocumentList className="h-4 w-4" />
            Job Management
          </p>
          <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">Manage Job Listings</h1>
          <p className="mt-1 text-slate-100/90">Track applicants and manage your open positions.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="kpi-card"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Jobs</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{filteredJobs.length}</h3></div><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><MdWork className="text-xl" /></div></div></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Jobs</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{activeJobs}</h3></div><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-700"><BsCalendarCheck className="text-xl" /></div></div></div>
          <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Applicants</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{Object.values(applicantsByJob).reduce((sum, count) => sum + count, 0)}</h3></div><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><BsPeopleFill className="text-xl" /></div></div></div>
          <div className="kpi-card"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Search</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{filteredJobs.length}</h3></div><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-700"><MdSearch className="text-xl" /></div></div></div>
        </div>

        <div className="grid grid-cols-1 gap-3 surface-card p-4 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, location..."
            className="md:col-span-2"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Applicants</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-wider text-slate-500">Date Posted</th>
                  <th className="p-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="group transition duration-150 hover:bg-sky-50/40">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900 transition-colors group-hover:text-pink-700">{job.title}</span>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MdLocationOn className="w-3 h-3" /> {job.location}</span>
                          <span>{job.company}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getStatusStyle(job.status)}`}>{job.status || 'Active'}</span></td>
                    <td className="p-5">
                      <Link
                        to={`/applicants?jobId=${encodeURIComponent(job.id)}&jobTitle=${encodeURIComponent(job.title || '')}`}
                        className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-800 hover:bg-pink-100"
                      >
                        <BsPeopleFill className="h-3.5 w-3.5" />
                        {applicantsByJob[job.id] || 0} View
                      </Link>
                    </td>
                    <td className="p-5"><span className="text-sm font-medium text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</span></td>
                    <td className="p-5 text-right"><button onClick={() => handleDelete(job.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Delete"><MdDelete className="text-lg text-red-600 " /></button></td>
                  </tr>
                ))}
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-sm text-slate-500">
                      No jobs found. Start by posting a new job.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;


