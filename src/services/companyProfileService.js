import api from './api';

export const getMyCompanyProfile = async () => {
  const response = await api.get('/auth/company-profile/me');
  return response.data;
};

export const updateMyCompanyProfile = async (payload) => {
  const response = await api.patch('/auth/company-profile/me', payload);
  return response.data;
};
