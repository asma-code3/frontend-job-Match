import api from './api';

export const getMyProfile = async () => {
  const response = await api.get('/auth/profile/me');
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await api.patch('/auth/profile/me', payload);
  return response.data;
};
