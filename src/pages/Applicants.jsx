import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteApplicant, getApplicants, updateApplicantStatus } from '../services/applicationService';
import { HiOutlineEnvelope, HiOutlineDocumentText, HiOutlineIdentification, HiOutlineSparkles, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import StatusAlert from '../components/StatusAlert';

const Applicants = () => {
  const [searchParams] = useSearchParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [pendingDeleteApplicantId, setPendingDeleteApplicantId] = useState('');
  const [statusDialog, setStatusDialog] = useState({ open: false, id: '', status: '', message: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const jobIdFilter = searchParams.get('jobId') || '';
  const filteredJobTitle = searchParams.get('jobTitle') || '';
  const panelClass = 'surface-card overflow-hidden rounded-[28px]';
  const statCardClass = 'rounded-[24px] border p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md';

  useEffect(() => {
    const loadApplicants = async () => {
      try {
        setLoading(true);
        const data = await getApplicants();
        setApplicants(data);
      } catch (error) {
        console.error('Failed to load applicants', error);
        setMessageType('error');
        setMessage(error?.response?.data?.message || 'Failed to load applicants.');
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'Hired' || newStatus === 'Interview') {
      setStatusDialog({ open: true, id, status: newStatus, message: '' });
      return;
    }
    await submitStatusUpdate(id, newStatus, '');
  };

  const submitStatusUpdate = async (id, status, statusMessage) => {
    try {
      const updated = await updateApplicantStatus(id, status, '', statusMessage);
      setApplicants((prev) => prev.map((item) => (item.id === id || item._id === id ? updated : item)));
      if (selectedApplicant && (selectedApplicant.id === id || selectedApplicant._id === id)) {
        setSelectedApplicant(updated);
      }
      setMessageType('success');
      setMessage('Status updated successfully.');
    } catch (error) {
      console.error('Failed to update status', error);
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDialogSubmit = async () => {
    const clean = statusDialog.message.trim();
    if (!clean) {
      setMessageType('error');
      setMessage(`Message is required for ${statusDialog.status}.`);
      return;
    }
    await submitStatusUpdate(statusDialog.id, statusDialog.status, clean);
    setStatusDialog({ open: false, id: '', status: '', message: '' });
  };

  const handleDeleteApplicant = async (id) => {
    if (pendingDeleteApplicantId !== id) {
      setPendingDeleteApplicantId(id);
      setMessageType('info');
      setMessage('Click delete again to confirm applicant deletion.');
      return;
    }
    try {
      await deleteApplicant(id);
      setApplicants((prev) => prev.filter((item) => !(item.id === id || item._id === id)));
      if (selectedApplicant && (selectedApplicant.id === id || selectedApplicant._id === id)) {
        setSelectedApplicant(null);
      }
      setMessageType('success');
      setMessage('Applicant deleted successfully.');
      setPendingDeleteApplicantId('');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Failed to delete applicant.');
    }
  };

  const resolveFileLink = (file) => {
    if (!file) return '';
    if (typeof file === 'object') {
      if (file.url) return file.url;
      if (file.preview) return file.preview;
      if (file.cvUrl) return file.cvUrl;
      if (file.fileUrl) return file.fileUrl;
      if (file.cv && (file.cv.url || file.cv.cvUrl)) return file.cv.url || file.cv.cvUrl;
    }
    return '';
  };

  const getApplicantEmail = (app) => app?.seekerProfile?.email || app?.seekerEmail || '-';
  const getApplicantPhone = (app) => app?.seekerProfile?.phone || app?.seekerPhone || '-';
  const getApplicantLocation = (app) => app?.seekerProfile?.location || app?.seekerLocation || '-';
  const getApplicantId = (app) => app?.id || app?._id || '';
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Interview':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Hired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };
  const profile = selectedApplicant?.seekerProfile || {};
  const displayEmail = profile.email || selectedApplicant?.seekerEmail || '-';
  const displayPhone = profile.phone || selectedApplicant?.seekerPhone || '-';
  const displayLocation = profile.location || selectedApplicant?.seekerLocation || '-';
  const displayTitle = profile.title || selectedApplicant?.seekerTitle || '-';
  const displaySkills = profile.skills || selectedApplicant?.seekerSkills || '-';
  const displayBio = profile.bio || selectedApplicant?.seekerBio || '-';
  const filteredApplicants = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applicants.filter((app) => {
      const matchesJob = !jobIdFilter || String(app.jobId) === String(jobIdFilter);
      const matchesText =
        !q ||
        String(app.seekerName || '').toLowerCase().includes(q) ||
        String(app.jobTitle || '').toLowerCase().includes(q) ||
        String(getApplicantEmail(app) || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      return matchesJob && matchesText && matchesStatus;
    });
  }, [applicants, jobIdFilter, search, statusFilter]);
  const stats = useMemo(() => {
    const baseList = jobIdFilter ? applicants.filter((app) => String(app.jobId) === String(jobIdFilter)) : applicants;
    return {
      total: baseList.length,
      pending: baseList.filter((app) => app.status === 'Pending').length,
      interview: baseList.filter((app) => app.status === 'Interview').length,
      hired: baseList.filter((app) => app.status === 'Hired').length,
    };
  }, [applicants, jobIdFilter]);

  return (
    <div className="page-shell page-container space-y-6">
      <div className="hero-panel">
        <h1 className="text-center text-3xl font-bold md:text-4xl">Applicants</h1>
        <p className="mt-2 text-center text-pink-100">Manage candidates who applied to your jobs.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className={`${statCardClass} border-slate-200 bg-white`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className={`${statCardClass} border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50`}>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Pending</p>
          <p className="mt-2 text-3xl font-bold text-blue-800">{stats.pending}</p>
        </div>
        <div className={`${statCardClass} border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50`}>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Interview</p>
          <p className="mt-2 text-3xl font-bold text-indigo-800">{stats.interview}</p>
        </div>
        <div className={`${statCardClass} border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50`}>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Hired</p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">{stats.hired}</p>
        </div>
      </div>
      {jobIdFilter ? (
        <div className={`${panelClass} flex flex-col gap-2 p-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between`}>
          <p>
            Showing applicants for job:
            <span className="ml-1 font-semibold text-slate-900">{filteredJobTitle || 'Selected Job'}</span>
          </p>
          <Link to="/applicants" className="text-pink-700 hover:text-pink-900 font-semibold">
            View all applicants
          </Link>
        </div>
      ) : null}
      <StatusAlert
        message={message}
        variant={messageType}
        onClose={() => setMessage('')}
        autoHide={messageType === 'success'}
        floating
      />

      <div className={`${panelClass} grid grid-cols-1 gap-3 p-4 md:grid-cols-3`}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidate, email, job title..."
          className="md:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-blue-200 bg-blue-50 text-blue-800 focus:border-blue-400"
        >
          <option value="All">All Status</option>
          <option value="Review">Review</option>
          <option value="Interview">Interview</option>
          <option value="Hired">Hired</option>
          <option value="Rejected">Rejected</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className={panelClass}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left">
          <thead className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Name</th>
              <th className="p-4 font-semibold text-slate-600">Applied For</th>
              <th className="p-4 font-semibold text-slate-600">Date</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm text-slate-500">
                  Loading applicants...
                </td>
              </tr>
            ) : null}
            {filteredApplicants.map((app) => (
              <tr key={getApplicantId(app)} className="cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-cyan-50/70" onClick={() => setSelectedApplicant(app)}>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-slate-800">{app.seekerName}</p>
                    <p className="text-xs text-slate-500">{getApplicantEmail(app)} | {getApplicantPhone(app)} | {getApplicantLocation(app)}</p>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{app.jobTitle}</td>
                <td className="p-4 text-sm text-slate-500">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}</td>
                <td className="p-4">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(getApplicantId(app), e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusStyle(app.status)}`}
                  >
                    <option>Review</option>
                    <option>Interview</option>
                    <option>Hired</option>
                    <option>Rejected</option>
                    <option>Pending</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApplicant(app);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Review
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteApplicant(getApplicantId(app));
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                        pendingDeleteApplicantId === getApplicantId(app) ? 'bg-rose-800' : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {pendingDeleteApplicantId === getApplicantId(app) ? 'Confirm Delete' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm text-slate-500">
                  No applicants match your search/filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>

      {selectedApplicant ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedApplicant(null)}>
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92))] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedApplicant.seekerName}</h2>
                <p className="text-sm text-gray-500">{displayEmail}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/applicants/${getApplicantId(selectedApplicant)}/profile`}
                  className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  View Full Profile
                </Link>
                <button className="font-medium text-slate-400 hover:text-slate-700" onClick={() => setSelectedApplicant(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                <p className="text-sky-800 flex items-center gap-2"><HiOutlineClipboardDocumentList className="w-4 h-4" /> Applied For</p>
                <p className="font-semibold text-gray-800">{selectedApplicant.jobTitle}</p>
              </div>
              <div className="p-4 rounded-xl bg-pink-50 border border-pink-200">
                <p className="text-pink-800 flex items-center gap-2"><HiOutlineSparkles className="w-4 h-4" /> Status</p>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusStyle(selectedApplicant.status)}`}>
                  {selectedApplicant.status}
                </span>
                <p className="mt-2 text-xs text-slate-600">
                  {selectedApplicant.statusMessage || 'No status message has been sent yet.'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-pink-50 border border-pink-100">
                <p className="text-pink-700 flex items-center gap-2"><HiOutlineEnvelope className="w-4 h-4" /> Email</p>
                <p className="font-semibold text-gray-800">{displayEmail}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-600">Phone</p>
                <p className="font-semibold text-gray-800">{displayPhone}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-600">Location</p>
                <p className="font-semibold text-gray-800">{displayLocation}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-600 flex items-center gap-2"><HiOutlineIdentification className="w-4 h-4" /> Title</p>
                <p className="font-semibold text-gray-800">{displayTitle}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-gray-500">Skills</p>
                <p className="font-semibold text-gray-800">{displaySkills}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
                <p className="text-gray-500">Bio</p>
                <p className="font-semibold text-gray-800">{displayBio}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 md:col-span-2">
                <p className="text-blue-700">Profile Attached</p>
                <p className="font-semibold text-slate-900">{selectedApplicant?.seekerProfile ? 'Yes, linked profile data is available' : 'No linked profile data'}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 md:col-span-2">
                <p className="text-emerald-700 mb-2">Hiring Actions</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(getApplicantId(selectedApplicant), 'Review')}
                    className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                  >
                    Mark Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(getApplicantId(selectedApplicant), 'Interview')}
                    className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Schedule Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(getApplicantId(selectedApplicant), 'Hired')}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Mark Hired
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(getApplicantId(selectedApplicant), 'Rejected')}
                    className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-indigo-700 mb-1 flex items-center gap-2"><HiOutlineDocumentText className="w-4 h-4" /> CV</p>
                {selectedApplicant.cvFileName ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{selectedApplicant.cvFileName}</p>
                    {resolveFileLink(selectedApplicant) ? (
                      <a
                        href={resolveFileLink(selectedApplicant)}
                        target="_blank"
                        rel="noreferrer"
                        download={selectedApplicant.cvFileName}
                        className="inline-flex items-center text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg"
                      >
                        Open CV
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500">No file link saved</p>
                    )}
                  </div>
                ) : (
                  <p className="font-semibold text-gray-800">-</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-pink-50 border border-pink-100 md:col-span-2">
                <p className="text-gray-500 mb-2">Certificates</p>
                {Array.isArray(selectedApplicant.certificates) && selectedApplicant.certificates.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApplicant.certificates.map((cert, index) => (
                      <div key={`${cert.fileName || cert.name}-${index}`} className="text-sm text-gray-800 border border-pink-200 bg-white rounded-lg p-3">
                        <p className="font-semibold">{cert.name || '-'}</p>
                        <p className="text-xs text-gray-600">{cert.fileName || '-'} {cert.size ? `- ${cert.size}` : ''}</p>
                        {resolveFileLink(cert) ? (
                          <a
                            href={resolveFileLink(cert)}
                            target="_blank"
                            rel="noreferrer"
                            download={cert.fileName || cert.name || `certificate-${index + 1}`}
                            className="inline-flex mt-2 items-center text-xs font-semibold text-pink-700 hover:text-pink-900 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-lg"
                          >
                            Open Certificate
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">No file link saved</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-semibold text-gray-800">-</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {statusDialog.open ? (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={() => setStatusDialog({ open: false, id: '', status: '', message: '' })}>
          <div className="w-full max-w-md rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92))] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{statusDialog.status} Message</h3>
            <p className="text-sm text-slate-500 mb-4">Send a clear message to the applicant.</p>
            <textarea
              value={statusDialog.message}
              onChange={(e) => setStatusDialog((prev) => ({ ...prev, message: e.target.value }))}
              rows={4}
              placeholder={statusDialog.status === 'Hired' ? 'Write offer details and next steps...' : 'Write interview date, time, and meeting details...'}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none text-sm"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusDialog({ open: false, id: '', status: '', message: '' })}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDialogSubmit}
                className="px-4 py-2 rounded-lg bg-sky-700 text-white font-semibold hover:bg-sky-800"
              >
                Send & Update
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Applicants;
