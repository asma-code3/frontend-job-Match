import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDefaultProfile, getProfile, saveProfile } from '../services/profileStorage';
import { getMyProfile, updateMyProfile as updateMyProfileApi } from '../services/profileService';
import { getSeekerDashboard } from '../services/dashboardService';
import { uploadFile } from '../services/uploadService';
import StatusAlert from '../components/StatusAlert';

import {
  HiUser,
  HiBriefcase,
  HiCloudArrowUp,
  HiDocumentText,
  HiPencil,
  HiXMark,
  HiTrash,
  HiSparkles,
  HiArrowUpTray,
  HiAcademicCap
} from 'react-icons/hi2';

const REQUIRED_PROFILE_FIELDS = ['name', 'email', 'phone', 'title', 'bio', 'skills'];
const MAX_UPLOAD_MB = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MyProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const defaultProfile = getDefaultProfile(user);
  const [form, setForm] = useState({
    name: defaultProfile.form.name,
    email: defaultProfile.form.email,
    phone: defaultProfile.form.phone || '',
    title: defaultProfile.form.title,
    bio: defaultProfile.form.bio,
    skills: defaultProfile.form.skills,
  });

  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(defaultProfile.avatarUrl || '');

  const [certificates, setCertificates] = useState([]);
  const [certificateName, setCertificateName] = useState('');

  const [cvDragOver, setCvDragOver] = useState(false);
  const [certDragOver, setCertDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [certificateMessage, setCertificateMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [stats, setStats] = useState({ applications: 0, interviews: 0 });
  const hasLoadedProfileRef = useRef(false);
  const autoSyncTimerRef = useRef(null);
  const inputClass = 'w-full rounded-2xl border border-[var(--line-soft)] bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:bg-white focus:ring-4 focus:ring-blue-100';
  const panelClass = 'surface-card overflow-hidden rounded-[28px]';
  const fieldLabelClass = 'ml-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500';

  const hasMeaningfulProfileData = (profile) => {
    if (!profile) return false;
    const form = profile.form || {};
    return Boolean(
      String(form.name || '').trim() ||
      String(form.email || '').trim() ||
      String(form.title || '').trim() ||
      String(form.bio || '').trim() ||
      String(form.skills || '').trim() ||
      String(profile.avatarUrl || '').trim() ||
      profile.cvPreview ||
      (Array.isArray(profile.certificates) && profile.certificates.length > 0)
    );
  };

  const getMissingProfileFields = (currentForm) =>
    REQUIRED_PROFILE_FIELDS.filter((field) => !String(currentForm?.[field] || '').trim());

  const completion = useMemo(() => {
    const requiredDone = REQUIRED_PROFILE_FIELDS.filter((field) => String(form?.[field] || '').trim()).length;
    return Math.round((requiredDone / REQUIRED_PROFILE_FIELDS.length) * 100);
  }, [form]);

  const validateForm = (currentForm) => {
    const nextErrors = {};
    if (!String(currentForm?.name || '').trim()) nextErrors.name = 'Full name is required.';
    if (!String(currentForm?.email || '').trim()) nextErrors.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(String(currentForm.email).trim())) nextErrors.email = 'Please enter a valid email address.';
    if (!String(currentForm?.phone || '').trim()) nextErrors.phone = 'Phone number is required.';
    if (!String(currentForm?.title || '').trim()) nextErrors.title = 'Professional title is required.';
    if (!String(currentForm?.bio || '').trim()) nextErrors.bio = 'Bio is required.';
    if (!String(currentForm?.skills || '').trim()) nextErrors.skills = 'Skills are required.';
    return nextErrors;
  };
  const getSafeCertificates = (list) =>
    (Array.isArray(list) ? list : []).map((cert) => ({
      id: cert.id,
      name: cert.name,
      fileName: cert.fileName,
      size: cert.size,
      type: cert.type,
      isImage: cert.isImage,
      preview: cert.preview || null,
      url: cert.url || cert.preview || null,
      publicId: cert.publicId || '',
    }));
  const buildProfilePayload = () => ({
    form: { ...form },
    avatarUrl,
    cvPreview,
    certificates: getSafeCertificates(certificates),
  });

  useEffect(() => {
    if (!user?.email) return;
    hasLoadedProfileRef.current = false;

    const loadProfile = async () => {
      try {
        const serverProfile = await getMyProfile();
        const localProfile = getProfile(user.email, user);
        const pickedProfile = hasMeaningfulProfileData(serverProfile) ? serverProfile : localProfile;

        setForm(pickedProfile?.form || defaultProfile.form);
        setAvatarUrl(pickedProfile?.avatarUrl || '');
        setCvPreview(pickedProfile?.cvPreview || null);
        setCertificates(Array.isArray(pickedProfile?.certificates) ? pickedProfile.certificates : []);
        saveProfile(user.email, pickedProfile);
      } catch {
        const saved = getProfile(user.email, user);
        setForm(saved.form);
        setAvatarUrl(saved.avatarUrl || '');
        setCvPreview(saved.cvPreview || null);
        setCertificates(Array.isArray(saved.certificates) ? saved.certificates : []);
      } finally {
        hasLoadedProfileRef.current = true;
      }
    };

    loadProfile();
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    if (!hasLoadedProfileRef.current) return;
    saveProfile(user.email, buildProfilePayload());
  }, [user?.email, form, avatarUrl, cvPreview, certificates]);

  useEffect(() => {
    if (!user?.email || !hasLoadedProfileRef.current) return;
    const missing = getMissingProfileFields(form);
    if (missing.length > 0) return;
    const profilePayload = buildProfilePayload();

    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    autoSyncTimerRef.current = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        await updateMyProfileApi(profilePayload);
        setLastSavedAt(new Date().toLocaleTimeString());
      } catch {
      } finally {
        setIsAutoSaving(false);
      }
    }, 900);

    return () => {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    };
  }, [user?.email, form, avatarUrl, cvPreview, certificates]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.email) return;
      try {
        const data = await getSeekerDashboard(user.email);
        setStats({ applications: data?.stats?.applications || 0, interviews: data?.stats?.interviews || 0 });
      } catch {
        setStats({ applications: 0, interviews: 0 });
      }
    };

    loadStats();
  }, [user?.email]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessageType('error');
      setMessage('Profile image must be an image file.');
      return;
    }

    try {
      const uploaded = await uploadFile(file, 'job-match/avatars');
      setAvatarUrl(uploaded?.url || '');
      setMessageType('success');
      setMessage('Profile image uploaded.');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Failed to upload profile image.');
    }

    e.target.value = '';
  };

  const handleCvSelect = (e) => {
    setMessage('');
    setCertificateMessage('');
    const file = e.target.files[0];
    if (file) processCvFile(file);
    e.target.value = '';
  };

  const handleCvDrop = (e) => {
    e.preventDefault();
    setMessage('');
    setCertificateMessage('');
    setCvDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processCvFile(file);
  };

  const processCvFile = async (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessageType('error');
      setMessage('Please upload only PDF or Word files (DOC/DOCX).');
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setMessageType('error');
      setMessage(`File size must be ${MAX_UPLOAD_MB}MB or less.`);
      return;
    }

    setCvFile(file);

    try {
      const uploaded = await uploadFile(file, 'job-match/cv');
      if (!uploaded?.url) {
        setMessageType('error');
        setMessage('CV upload failed. Please try again.');
        return;
      }

      setCvPreview({
        name: uploaded?.fileName || file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type,
        url: uploaded.url,
        publicId: uploaded?.publicId || '',
      });

      setMessageType('success');
      setMessage('CV uploaded successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Failed to upload CV.');
    }
  };

  const removeCv = () => {
    setCvFile(null);
    setCvPreview(null);
  };

  const handleCertSelect = (e) => {
    setCertificateMessage('');
    setMessage('');
    const file = e.target.files[0];
    if (file) processCertFile(file);
    e.target.value = '';
  };

  const handleCertDrop = (e) => {
    e.preventDefault();
    setCertificateMessage('');
    setMessage('');
    setCertDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processCertFile(file);
  };

  const processCertFile = async (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setCertificateMessage('Please upload only PDF, Word, or image files (PNG/JPG/WEBP).');
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setCertificateMessage(`File size must be ${MAX_UPLOAD_MB}MB or less.`);
      return;
    }

    const certName = certificateName.trim();
    if (!certName) {
      setCertificateMessage('Please enter the certificate name before upload.');
      return;
    }

    const newCert = {
      id: Date.now(),
      name: certName,
      fileName: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      isImage: file.type.startsWith('image/'),
      url: ''
    };

    try {
      const uploaded = await uploadFile(file, 'job-match/certificates');
      if (!uploaded?.url) {
        setCertificateMessage('Certificate upload failed. Please try again.');
        return;
      }

      newCert.url = uploaded.url;
      newCert.publicId = uploaded?.publicId || '';
      if (newCert.isImage) newCert.preview = uploaded.url;

      setCertificates((prev) => [...prev, newCert]);
      setCertificateName('');
      setCertificateMessage(`Certificate "${certName}" uploaded successfully.`);
    } catch (error) {
      setCertificateMessage(error?.response?.data?.message || 'Failed to upload certificate.');
    }
  };

  const removeCert = (id) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    setCertificateMessage('Certificate removed.');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('success');
    setCertificateMessage('');

    const validationErrors = validateForm(form);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const missing = getMissingProfileFields(form);
      setMessageType('error');
      setMessage(`Fadlan buuxi xogta ka maqan: ${missing.join(', ')}`);
      return;
    }

    const profilePayload = buildProfilePayload();
    saveProfile(user?.email, profilePayload);

    try {
      setIsSaving(true);
      const response = await updateMyProfileApi(profilePayload);
      if (response?.user?.name) updateUserProfile({ name: response.user.name });
      if (response?.isComplete === false) {
        const missingText = Array.isArray(response?.missingFields) && response.missingFields.length > 0
          ? ` Missing: ${response.missingFields.join(', ')}.`
          : '';
        setMessageType('success');
        setMessage(`Draft saved to MongoDB.${missingText}`);
      } else {
        setMessageType('success');
        setMessage('Profile updated successfully.');
      }
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (error) {
      if (form.name && form.name !== user?.name) updateUserProfile({ name: form.name });
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Profile saved locally. MongoDB sync failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const missingRequired = getMissingProfileFields(form);

  return (
    <div className="page-shell">
      <div className="page-container max-w-6xl relative">
        <div className="pointer-events-none absolute -top-16 -left-10 w-72 h-72 rounded-full bg-blue-200/40 blur-3xl"></div>
        <div className="pointer-events-none absolute top-40 -right-10 w-80 h-80 rounded-full bg-sky-200/30 blur-3xl"></div>

        <div className="hero-panel relative mb-8 px-6 py-6 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="hero-kicker mb-3">
                <HiSparkles className="h-4 w-4" />
                My Profile
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                My Profile
              </h1>
              <p className="mt-2 font-medium">Build a complete profile so employers can quickly understand your strengths.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Completion</span>
                <span className="text-sm font-bold text-white">{completion}%</span>
                <div className="h-2 w-20 overflow-hidden rounded-full bg-white/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? 'bg-emerald-300' : 'bg-white'}`}
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
              </div>

              {isAutoSaving ? (
                <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white animate-pulse">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : lastSavedAt ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
                  Saved {lastSavedAt}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <StatusAlert
          message={message}
          variant={messageType}
          onClose={() => setMessage('')}
          autoHide={messageType === 'success'}
          floating
          className="top-5 right-5 min-w-[260px] max-w-sm"
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-5">
            <div className={`${panelClass} p-6`}>
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border border-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={form.name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <HiUser className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow transition-colors hover:bg-blue-800">
                  <HiPencil className="w-4 h-4" />
                </label>
                <input id="avatar-upload" type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{form.name || 'Your Name'}</h3>
              <p className="text-blue-700 font-medium text-sm mt-1">{form.title || 'Professional Title'}</p>

              <div className="grid grid-cols-2 gap-3 w-full mt-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center">
                  <HiBriefcase className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <span className="block text-lg font-extrabold text-slate-800">{stats.applications}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Applied</span>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-center">
                  <HiUser className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <span className="block text-lg font-extrabold text-slate-800">{stats.interviews}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Interviews</span>
                </div>
              </div>
            </div>

            <div className={`${panelClass} p-6`}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Readiness</p>
              {missingRequired.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                  Profile complete. You are ready to apply.
                </div>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                  Missing: {missingRequired.join(', ')}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className={panelClass}>
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HiUser className="text-blue-600" />
                  Profile Information
                </h2>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">Single Form</span>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={fieldLabelClass}>Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. John Doe" />
                    {fieldErrors.name && <p className="text-xs text-blue-600 ml-1 flex items-center gap-1"><HiXMark className="w-3 h-3" />{fieldErrors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className={fieldLabelClass}>Contact Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className={inputClass} />
                    {fieldErrors.email && <p className="text-xs text-rose-600 ml-1 flex items-center gap-1"><HiXMark className="w-3 h-3" />{fieldErrors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={fieldLabelClass}>Phone Number</label>
                  <input name="phone" value={form.phone || ''} onChange={handleChange} className={inputClass} placeholder="e.g. +25261xxxxxxx" />
                  {fieldErrors.phone && <p className="text-xs text-rose-600 ml-1 flex items-center gap-1"><HiXMark className="w-3 h-3" />{fieldErrors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={fieldLabelClass}>Professional Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Senior Software Engineer" />
                  {fieldErrors.title && <p className="text-xs text-rose-600 ml-1 flex items-center gap-1"><HiXMark className="w-3 h-3" />{fieldErrors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={fieldLabelClass}>Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" className={`${inputClass} resize-none leading-relaxed`} placeholder="Tell employers about your background, tools, and impact." />
                  {fieldErrors.bio && <p className="text-xs text-rose-600 ml-1 flex items-center gap-1"><HiXMark className="w-3 h-3" />{fieldErrors.bio}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={fieldLabelClass}>Skills</label>
                  <input name="skills" value={form.skills} onChange={handleChange} className={inputClass} placeholder="React, Node.js, TypeScript..." />
                  {fieldErrors.skills && <p className="text-xs text-rose-600 ml-1 flex items-center gap-1"><HiXMark className="w-3 h-3" />{fieldErrors.skills}</p>}
                </div>

                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Resume / CV</label>
                  {!cvPreview ? (
                    <div onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }} onDragLeave={() => setCvDragOver(false)} onDrop={handleCvDrop} onClick={() => document.getElementById('cv-upload').click()} className={`relative rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-300 ${cvDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}>
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <HiCloudArrowUp className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">Upload your CV</h3>
                      <p className="text-xs text-slate-500">PDF or DOCX (max 5MB)</p>
                      <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvSelect} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-white text-blue-700 rounded-lg flex items-center justify-center border border-slate-200">
                          <HiDocumentText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{cvPreview.name}</p>
                          <p className="text-xs text-slate-500">{cvPreview.size}</p>
                          {cvPreview.url ? (
                            <a href={cvPreview.url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
                              <HiArrowUpTray className="w-3 h-3" /> View File
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <button type="button" onClick={removeCv} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Certifications</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={certificateName} onChange={(e) => setCertificateName(e.target.value)} placeholder="e.g. AWS Certified" className={inputClass} />
                    <div onDragOver={(e) => { e.preventDefault(); setCertDragOver(true); }} onDragLeave={() => setCertDragOver(false)} onDrop={handleCertDrop} onClick={() => document.getElementById('cert-upload').click()} className={`flex items-center justify-center border-2 border-dashed rounded-lg p-3 cursor-pointer transition-all duration-200 gap-2 ${certDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                              <HiCloudArrowUp className="w-4 h-4" />
                            </div>
                      <span className="text-xs font-semibold text-slate-600">Click or Drag File</span>
                      <input id="cert-upload" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleCertSelect} />
                    </div>
                  </div>

                  {certificateMessage ? (
                    <div className={`p-2.5 rounded-lg text-xs font-medium border ${certificateMessage.includes('failed') || certificateMessage.includes('required') ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                      {certificateMessage}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm hover:border-blue-200 transition-all duration-200">
                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          {cert.isImage ? (
                            <img src={cert.preview} alt={cert.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                              <HiDocumentText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{cert.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate">{cert.fileName} | {cert.size}</p>
                            {cert.url ? (
                              <a href={cert.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-block text-[11px] font-medium text-blue-700 hover:underline">
                                View Certificate
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeCert(cert.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all focus:opacity-100">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {certificates.length === 0 && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <HiAcademicCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-500">No certificates uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 pb-12">
              <button type="button" onClick={handleSubmit} disabled={isSaving} className="btn-primary group relative px-10 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-blue-200">
                <span className="relative z-10 flex items-center gap-2">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                  {!isSaving && <HiSparkles className="w-4 h-4 text-blue-100 transition-colors" />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
