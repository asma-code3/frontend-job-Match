import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApplicantById } from '../services/applicationService';

const ApplicantProfile = () => {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getApplicantById(id);
        setApplicant(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load applicant profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="page-shell">Loading applicant profile...</div>;
  if (error || !applicant) return <div className="page-shell text-rose-600">{error || 'Applicant not found'}</div>;

  const profile = applicant?.seekerProfile || {};
  const certs = Array.isArray(applicant?.certificates) ? applicant.certificates : [];

  return (
    <div className="page-shell">
      <div className="page-container max-w-4xl surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Applicant Full Profile</h1>
          <Link to="/applicants" className="text-sm font-semibold text-blue-700 hover:underline">Back to Applicants</Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Name</p><p className="font-semibold text-slate-900">{applicant.seekerName || '-'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Email</p><p className="font-semibold text-slate-900">{profile.email || applicant.seekerEmail || '-'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Phone</p><p className="font-semibold text-slate-900">{profile.phone || applicant.seekerPhone || '-'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Location</p><p className="font-semibold text-slate-900">{profile.location || applicant.seekerLocation || '-'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Title</p><p className="font-semibold text-slate-900">{profile.title || applicant.seekerTitle || '-'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2"><p className="text-xs text-slate-500">Skills</p><p className="font-semibold text-slate-900">{profile.skills || applicant.seekerSkills || '-'}</p></div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2"><p className="text-xs text-slate-500">Bio</p><p className="font-semibold text-slate-900">{profile.bio || applicant.seekerBio || '-'}</p></div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">CV</p>
            {applicant.cvUrl ? <a href={applicant.cvUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 hover:underline">{applicant.cvFileName || 'Open CV'}</a> : <p className="font-semibold text-slate-700">-</p>}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Certificates</p>
            {certs.length > 0 ? certs.map((cert, idx) => (
              <div key={`${cert.fileName || cert.name}-${idx}`} className="mt-2">
                <p className="text-sm font-semibold text-slate-800">{cert.name || cert.fileName || `Certificate ${idx + 1}`}</p>
                {(cert.url || cert.preview) ? <a href={cert.url || cert.preview} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 hover:underline">Open file</a> : null}
              </div>
            )) : <p className="font-semibold text-slate-700">-</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfile;
