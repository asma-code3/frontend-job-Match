import api from './api';

export const getEmployerDashboard = async () => {
  const response = await api.get('/dashboard/employer');
  return response.data;
};

export const getSeekerDashboard = async (seekerEmail) => {
  const response = await api.get('/dashboard/seeker', { params: { seekerEmail } });
  return response.data;
};
