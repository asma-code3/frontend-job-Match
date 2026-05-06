import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineBuildingOffice2, HiOutlineBriefcase, HiOutlineMapPin } from 'react-icons/hi2';

const JobCard = ({ job, isAdmin = false, adminState, onAdminStatusChange, onAdminDelete }) => {
  const isRemote = String(job.location || '').toLowerCase().includes('remote');

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.14)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-sky-200 text-xl font-black text-blue-800 transition duration-300 group-hover:scale-105 group-hover:from-blue-200 group-hover:to-cyan-200">
            {job.company?.charAt(0) || 'J'}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 transition group-hover:text-blue-800">{job.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <HiOutlineBuildingOffice2 className="h-4 w-4 text-blue-700" />
              {job.company}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 transition duration-300 group-hover:bg-blue-700 group-hover:text-white">
          {job.status || 'Active'}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
          <HiOutlineMapPin className="h-3.5 w-3.5 text-blue-700" />
          {job.location}
        </span>
        {job.type ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-700">
            <HiOutlineBriefcase className="h-3.5 w-3.5" />
            {job.type}
          </span>
        ) : null}
        {isRemote ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
            Remote friendly
          </span>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Admin Controls</p>
          <div className="flex items-center gap-2">
            <select
              value={job.status || 'Active'}
              onChange={(e) => onAdminStatusChange?.(job.id, e.target.value)}
              className="min-h-[36px] text-xs"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </select>
            <button
              onClick={() => onAdminDelete?.(job.id)}
              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Delete
            </button>
          </div>
          {adminState?.text ? (
            <p className={`mt-2 text-xs ${adminState.type === 'error' ? 'text-rose-600' : 'text-blue-700'}`}>
              {adminState.text}
            </p>
          ) : null}
        </div>
      ) : null}

      {job.description ? (
        <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-500">{job.description}</p>
      ) : (
        <p className="mb-5 text-sm leading-6 text-slate-500">Explore this opportunity and review whether it fits your goals, location, and preferred work style.</p>
      )}

      <div className="mt-auto">
        <Link to={`/job/${job.id}`} className="btn-primary block w-full py-3 text-center transition duration-300 group-hover:shadow-[0_14px_28px_rgba(37,99,235,0.28)]">
          View & Apply
        </Link>
      </div>
    </article>
  );
};

export default JobCard;
