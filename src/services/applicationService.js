import api from './api';

export const getApplications = async (seekerEmail) => {
  const response = await api.get('/applications', { params: { seekerEmail } });
  return response.data;
};

export const createApplication = async (payload) => {
  const response = await api.post('/applications', payload);
  return response.data;
};

export const updateMyApplication = async (id, payload) => {
  const response = await api.patch(`/applications/${id}`, payload);
  return response.data;
};

export const getApplicants = async () => {
  const response = await api.get('/applicants');
  return response.data;
};

export const getApplicantById = async (id) => {
  const response = await api.get(`/applicants/${id}`);
  return response.data;
};

export const updateApplicantStatus = async (id, status, contactInfo = '', statusMessage = '') => {
  const response = await api.patch(`/applicants/${id}/status`, { status, contactInfo, statusMessage });
  return response.data;
};

export const deleteApplicant = async (id) => {
  const response = await api.delete(`/applicants/${id}`);
  return response.data;
};

export const updateApplicationAsAdmin = async (id, payload) => {
  const response = await api.patch(`/admin/applications/${id}`, payload);
  return response.data;
};

export const deleteApplicationAsAdmin = async (id) => {
  const response = await api.delete(`/admin/applications/${id}`);
  return response.data;
};
