import api from './api';

export const getAdminOverview = async () => {
  const response = await api.get('/admin/overview');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateAdminUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const updateAdminUserSecurity = async (userId, payload) => {
  const response = await api.patch(`/admin/users/${userId}/security`, payload);
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAdminJobs = async () => {
  const response = await api.get('/admin/jobs');
  return response.data;
};

export const deleteAdminJob = async (jobId) => {
  const response = await api.delete(`/admin/jobs/${jobId}`);
  return response.data;
};

export const getAdminApplications = async () => {
  const response = await api.get('/admin/applications');
  return response.data;
};

export const updateAdminApplication = async (applicationId, payload) => {
  const response = await api.patch(`/admin/applications/${applicationId}`, payload);
  return response.data;
};

export const deleteAdminApplication = async (applicationId) => {
  const response = await api.delete(`/admin/applications/${applicationId}`);
  return response.data;
};
