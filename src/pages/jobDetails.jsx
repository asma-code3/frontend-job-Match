import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteJob, getJobById, updateJob } from '../services/jobService';
import { createApplication, getApplications } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/profileStorage';
import {
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import StatusAlert from '../components/StatusAlert';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [adminState, setAdminState] = useState({ type: '', text: '' });
  const [pendingDelete, setPendingDelete] = useState(false);
  const [applyFormOpen, setApplyFormOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', phone: '', location: '' });
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch (err) {
        setError('Job not found');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  useEffect(() => {
    const loadMyApplications = async () => {
      if (!user?.email || !id) return;
      try {
        const apps = await getApplications(user.email);
        setAlreadyApplied((apps || []).some((a) => a.jobId === id));
      } catch {
        setAlreadyApplied(false);
      }
    };
    loadMyApplications();
  }, [user?.email, id]);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading job details...</div>;
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-slate-500">
        <h2 className="mb-4 text-2xl font-bold">{error || 'Job not found'}</h2>
        <Link to="/jobs" className="text-pink-700 hover:underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const handleApply = async () => {
    if (alreadyApplied) {
      setMessageType('info');
      setMessage('You have already applied for this job.');
      return;
    }
    if (!user?.email) {
      setMessageType('error');
      setMessage('Please login to the system first before applying.');
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
    setApplyFormOpen(true);
  };

  const submitApply = async () => {
    setApplying(true);
    setMessage('');
    try {
      const profile = getProfile(user.email, user);
      if (!applyForm.name.trim() || !applyForm.email.trim() || !applyForm.phone.trim() || !applyForm.location.trim()) {
        setMessageType('error');
        setMessage('Name, email, phone, and location are required.');
        return;
      }

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
      setApplyFormOpen(false);
      setAlreadyApplied(true);
      setMessageType('success');
      setMessage('Application submitted successfully.');
      window.setTimeout(() => {
        navigate('/applications');
      }, 700);
    } catch (err) {
      if (err?.response?.status === 409) {
        setAlreadyApplied(true);
        setMessageType('info');
        setMessage('You have already applied for this job.');
      } else {
        setMessageType('error');
        setMessage(err?.response?.data?.message || 'Failed to submit application.');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleAdminStatus = async (status) => {
    setAdminState({ type: 'loading', text: 'Updating...' });
    try {
      await updateJob(job.id, { status });
      setJob((prev) => ({ ...prev, status }));
      setAdminState({ type: 'success', text: 'Status updated.' });
    } catch (err) {
      setAdminState({ type: 'error', text: err?.response?.data?.message || 'Update failed.' });
    }
  };

  const handleAdminDelete = async () => {
    if (!pendingDelete) {
      setPendingDelete(true);
      setAdminState({ type: 'error', text: 'Click delete again to confirm.' });
      return;
    }
    setAdminState({ type: 'loading', text: 'Deleting...' });
    try {
      await deleteJob(job.id);
      navigate('/jobs');
    } catch (err) {
      setAdminState({ type: 'error', text: err?.response?.data?.message || 'Delete failed.' });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-4xl surface-card p-8">
        <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
        <p className="mt-1 text-lg font-medium text-blue-700">{job.company}</p>

        {user?.role === 'admin' ? (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Admin Controls</p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={job.status || 'Active'}
                onChange={(e) => handleAdminStatus(e.target.value)}
                className="min-h-[38px] text-sm"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                onClick={handleAdminDelete}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete Job
              </button>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                Current Status: {job.status || 'Active'}
              </span>
            </div>
            {adminState.text ? (
              <p className={`mt-2 text-xs ${adminState.type === 'error' ? 'text-rose-600' : 'text-blue-700'}`}>
                {adminState.text}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <HiOutlineMapPin className="h-4 w-4" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <HiOutlineBriefcase className="h-4 w-4" />
            {job.type}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <HiOutlineCurrencyDollar className="h-4 w-4" />
            {job.salary}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            <HiOutlineSparkles className="h-4 w-4" />
            Match: {job.matchScore || 0}%
          </span>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
            <HiOutlineDocumentText className="h-5 w-5 text-blue-700" />
            Description
          </h2>
          <p className="leading-relaxed text-slate-700">{job.description || 'No description provided.'}</p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-slate-900">
            <HiOutlineCheckCircle className="h-5 w-5 text-emerald-600" />
            Requirements
          </h2>
          <div className="flex flex-wrap gap-2">
            {(job.requirements || []).length > 0 ? (
              job.requirements.map((req) => (
                <span key={req} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  {req}
                </span>
              ))
            ) : (
              <span className="text-slate-500">No requirements listed.</span>
            )}
          </div>
        </div>
        <StatusAlert
          message={message}
          variant={messageType}
          onClose={() => setMessage('')}
          autoHide={messageType === 'success'}
          className="mt-6"
        />
        {applyFormOpen ? (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-800">Quick Apply Form</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input value={applyForm.name} onChange={(e) => setApplyForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full Name" />
              <input type="email" value={applyForm.email} onChange={(e) => setApplyForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
              <input value={applyForm.phone} onChange={(e) => setApplyForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" />
              <input value={applyForm.location} onChange={(e) => setApplyForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => setApplyFormOpen(false)} className="btn-secondary px-4 py-2">Cancel</button>
              <button onClick={submitApply} className="btn-primary px-4 py-2">Submit Apply</button>
            </div>
          </div>
        ) : null}
        <button
          onClick={handleApply}
          disabled={applying || alreadyApplied}
          className={`mt-8 w-full py-3 ${
            alreadyApplied
              ? 'rounded-lg bg-slate-200 text-slate-600 cursor-not-allowed'
              : 'btn-primary disabled:cursor-not-allowed disabled:opacity-70'
          }`}
        >
          {applying ? 'Applying...' : alreadyApplied ? 'Already Applied' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;

