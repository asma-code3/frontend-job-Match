import api from './api';

export const getJobs = async () => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs', error);
    return [];
  }
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (payload) => {
  const response = await api.post('/jobs', payload);
  return response.data;
};

export const updateJob = async (id, payload) => {
  const response = await api.put(`/jobs/${id}`, payload);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};
