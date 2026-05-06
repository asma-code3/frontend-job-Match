import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  deleteApplicationAsAdmin,
  getApplications,
  updateApplicationAsAdmin,
  updateMyApplication
} from '../services/applicationService';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { getApiErrorMessage } from '../utils/apiError';
import StatusAlert from '../components/StatusAlert';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [editModal, setEditModal] = useState({ open: false, app: null });
  const [editForm, setEditForm] = useState({ seekerPhone: '', seekerLocation: '', seekerTitle: '', seekerSkills: '', seekerBio: '' });

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.email) return;
      try {
        const data = await getApplications(user.email);
        setApplications(data);
      } catch (error) {
        console.error('Failed to load applications', error);
        setMessageType('error');
        setMessage(getApiErrorMessage(error, 'Failed to load applications.'));
      }
    };

    loadApplications();
  }, [user?.email]);

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (applications || []).filter((app) => {
      const matchesText =
        !q ||
        String(app.company || '').toLowerCase().includes(q) ||
        String(app.jobTitle || '').toLowerCase().includes(q) ||
        String(app.status || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || String(app.status || '') === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Interview':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700 ring-rose-600/10';
      case 'Pending':
        return 'bg-blue-100 text-blue-700 ring-blue-600/10';
      default:
        return 'bg-sky-100 text-sky-700 ring-sky-700/10';
    }
  };

  const openEditModal = (app) => {
    setEditForm({
      seekerPhone: app?.seekerPhone || app?.seekerProfile?.phone || '',
      seekerLocation: app?.seekerLocation || app?.seekerProfile?.location || '',
      seekerTitle: app?.seekerTitle || app?.seekerProfile?.title || '',
      seekerSkills: app?.seekerSkills || app?.seekerProfile?.skills || '',
      seekerBio: app?.seekerBio || app?.seekerProfile?.bio || '',
    });
    setEditModal({ open: true, app });
  };

  const submitEdit = async () => {
    if (!editModal.app?.id) return;
    try {
      const updated = await updateMyApplication(editModal.app.id, editForm);
      setApplications((prev) => prev.map((item) => (item.id === editModal.app.id ? { ...item, ...updated } : item)));
      setEditModal({ open: false, app: null });
      setMessageType('success');
      setMessage('Application updated successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error, 'Failed to update application.'));
    }
  };

  const handleAdminStatusUpdate = async (id, status) => {
    try {
      const updated = await updateApplicationAsAdmin(id, { status });
      setApplications((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setMessageType('success');
      setMessage('Application status updated.');
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error, 'Failed to update application status.'));
    }
  };

  const handleAdminDelete = async (id) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setMessageType('info');
      setMessage('Click delete again to confirm application deletion.');
      return;
    }
    try {
      await deleteApplicationAsAdmin(id);
      setApplications((prev) => prev.filter((item) => item.id !== id));
      setMessageType('success');
      setMessage('Application deleted successfully.');
      setPendingDeleteId('');
    } catch (error) {
      setMessageType('error');
      setMessage(getApiErrorMessage(error, 'Failed to delete application.'));
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-5xl ">
        <div className="hero-panel mb-8 rounded-2xl bg-blue-600 p-6">
          <p className="hero-kicker mb-2  inline-flex gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
            <HiOutlineClipboardDocumentList className="h-5 w-5 text-blue-700" />
            Applications
          </p>
          <h1 className="text-3xl font-bold  text-center tracking-wide  text-white">My Applications</h1>
          <p className="mt-2 text-lg text-black text-center">Track the status of your job applications.</p>
        </div>
        <StatusAlert
          message={message}
          variant={messageType}
          onClose={() => setMessage('')}
          autoHide={messageType === 'success'}
          floating
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, job title, status..."
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Company</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Job Position</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Date Applied</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Response</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app, index) => (
                  <tr key={app.id} className={`transition-colors duration-200 hover:bg-sky-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-100/50'}`}>
                    <td className="px-8 py-4 font-medium text-slate-900">{app.company}</td>
                    <td className="px-8 py-4 font-medium text-slate-600">{app.jobTitle}</td>
                    <td className="px-8 py-4 text-sm text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-4">
                      {user?.role === 'admin' ? (
                        <select
                          value={app.status || 'Pending'}
                          onChange={(e) => handleAdminStatusUpdate(app.id, e.target.value)}
                          className={`min-h-[34px] rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(app.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Review">Review</option>
                          <option value="Interview">Interview</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(app.status)}`}>
                          {app.status}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-700">
                      {app.status === 'Hired' || app.status === 'Interview' ? app.statusMessage || '-' : '-'}
                    </td>
                    <td className="px-8 py-4">
                      {user?.role === 'admin' ? (
                        <button
                          onClick={() => handleAdminDelete(app.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                            pendingDeleteId === app.id ? 'bg-rose-800' : 'bg-rose-600 hover:bg-rose-700'
                          }`}
                        >
                          {pendingDeleteId === app.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      ) : user?.role === 'seeker' && app.status === 'Pending' ? (
                        <button onClick={() => openEditModal(app)} className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">
                          Edit
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-10 text-center text-sm text-slate-500">
                      No applications match your search/filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditModal({ open: false, app: null })}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Edit Application</h3>
            <p className="mb-4 text-sm text-slate-500">You can edit only while status is Pending.</p>
            <div className="space-y-3">
              <input value={editForm.seekerPhone} onChange={(e) => setEditForm((p) => ({ ...p, seekerPhone: e.target.value }))} placeholder="Phone" />
              <input value={editForm.seekerLocation} onChange={(e) => setEditForm((p) => ({ ...p, seekerLocation: e.target.value }))} placeholder="Location" />
              <input value={editForm.seekerTitle} onChange={(e) => setEditForm((p) => ({ ...p, seekerTitle: e.target.value }))} placeholder="Title" />
              <input value={editForm.seekerSkills} onChange={(e) => setEditForm((p) => ({ ...p, seekerSkills: e.target.value }))} placeholder="Skills" />
              <textarea value={editForm.seekerBio} onChange={(e) => setEditForm((p) => ({ ...p, seekerBio: e.target.value }))} placeholder="Bio" />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn-secondary px-4" onClick={() => setEditModal({ open: false, app: null })}>Cancel</button>
              <button className="btn-primary px-4" onClick={submitEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MyApplications;
