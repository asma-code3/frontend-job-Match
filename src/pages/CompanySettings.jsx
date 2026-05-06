import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineBuildingOffice2,
  HiOutlineGlobeAlt,
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiOutlineDocumentText,
  HiOutlineCamera,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { uploadFile } from '../services/uploadService';
import { getCompanyProfile, saveCompanyProfile } from '../services/companyProfileStorage';
import { getMyCompanyProfile, updateMyCompanyProfile } from '../services/companyProfileService';
import StatusAlert from '../components/StatusAlert';

const CompanySettings = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState({
    name: "Tech Solutions Inc.",
    website: "https://techsolutions.com",
    location: "Mogadishu, Somalia",
    description: "We build modern web applications.",
    email: "contact@techsolutions.com",
    logoUrl: '',
  });
  const initials = useMemo(() => {
    const source = company.name || 'Company';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [company.name]);

  useEffect(() => {
    if (!user?.email) return;
    hasLoadedRef.current = false;

    const loadCompanyProfile = async () => {
      const localProfile = getCompanyProfile(user?.email);
      try {
        const serverProfile = await getMyCompanyProfile();
        const hasServerData = Boolean(serverProfile?.hasStoredProfile);

        const picked = hasServerData ? serverProfile : localProfile;
        setCompany(picked);
        saveCompanyProfile(user?.email, picked);

        if (!hasServerData && localProfile) {
          try {
            const synced = await updateMyCompanyProfile(localProfile);
            setCompany(synced);
            saveCompanyProfile(user?.email, synced);
          } catch {
          }
        }
      } catch {
        setCompany(localProfile);
      } finally {
        hasLoadedRef.current = true;
      }
    };

    loadCompanyProfile();
  }, [user?.email]);

  const handleChange = (e) => setCompany({ ...company, [e.target.name]: e.target.value });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessageType('error');
      setMessage('Logo must be an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessageType('error');
      setMessage('Logo size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    try {
      const uploaded = await uploadFile(file, 'job-match/company-logos');
      const next = { ...company, logoUrl: uploaded?.url || '' };
      setCompany(next);
      saveCompanyProfile(user?.email, next);
      setMessageType('success');
      setMessage('Company logo uploaded successfully.');
    } catch (error) {
      const readAsDataUrl = () =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      try {
        const localUrl = await readAsDataUrl();
        const next = { ...company, logoUrl: localUrl };
        setCompany(next);
        saveCompanyProfile(user?.email, next);
        setMessageType('info');
        setMessage('Cloud upload failed, but logo was saved locally.');
      } catch {
        setMessageType('error');
        setMessage(error?.response?.data?.message || 'Failed to upload company logo.');
      }
    }
    e.target.value = '';
  };

  const handleSave = () => {
    const persist = async () => {
      try {
        setIsSaving(true);
        const saved = await updateMyCompanyProfile(company);
        setCompany(saved);
        saveCompanyProfile(user?.email, saved);
        setMessageType('success');
        setMessage('Company settings saved to MongoDB Atlas.');
      } catch (error) {
        saveCompanyProfile(user?.email, company);
        setMessageType('error');
        setMessage(error?.response?.data?.message || 'MongoDB sync failed. Settings were kept locally.');
      } finally {
        setIsSaving(false);
      }
    };

    persist();
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-4xl space-y-6">
      <div className="hero-panel">
        <p className="hero-kicker">
          <HiOutlineBuildingOffice2 className="h-4 w-4" />
          Company Settings
        </p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Company Profile</h1>
        <p className="mt-1 text-slate-100/90">Update your company profile and contact info.</p>
      </div>

      <div className="space-y-6 surface-card p-6 md:p-8">
        <StatusAlert
          message={message}
          variant={messageType}
          onClose={() => setMessage('')}
          autoHide={messageType === 'success'}
        />

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-blue-700 text-2xl font-bold text-white shadow">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name || 'Company logo'} className="h-full w-full object-cover" />
              ) : (
                initials || 'CO'
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Company Logo</p>
              <p className="text-xs text-slate-500">Recommended: square image, 512x512</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            <HiOutlineCamera className="h-4 w-4" />
            Change Logo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company Name</label>
            <input 
              type="text" 
              name="name" 
              value={company.name} 
              onChange={handleChange}
              className="w-full"
            />
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <HiOutlineBuildingOffice2 className="h-4 w-4" />
              Official business name
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Website URL</label>
            <input 
              type="url" 
              name="website" 
              value={company.website} 
              onChange={handleChange}
              className="w-full"
            />
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <HiOutlineGlobeAlt className="h-4 w-4" />
              Public website link
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
            <input 
              type="text" 
              name="location" 
              value={company.location} 
              onChange={handleChange}
              className="w-full"
            />
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <HiOutlineMapPin className="h-4 w-4" />
              City and country
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contact Email</label>
            <input 
              type="email" 
              name="email" 
              value={company.email} 
              onChange={handleChange}
              className="w-full"
            />
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <HiOutlineEnvelope className="h-4 w-4" />
              Main contact for applicants
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">About Company</label>
          <textarea 
            name="description" 
            rows="4" 
            value={company.description} 
            onChange={handleChange}
            className="w-full resize-none"
          ></textarea>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <HiOutlineDocumentText className="h-4 w-4" />
            Short overview of what your company does
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasLoadedRef.current}
          className="btn-primary"
        >
          <HiOutlineCheckCircle className="h-5 w-5" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default CompanySettings;
