import axios from 'axios';

const getBaseURL = () => {
  const customBase = import.meta.env.VITE_API_BASE_URL;
  if (customBase) {
    return `${customBase.replace(/\/$/, '')}/api/v1`;
  }
  return '/api/v1';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const executeSpatialSimulation = async (payload) => {
  const response = await apiClient.post('/simulation/run', payload);
  return response.data;
};

export const syncOfflineEventQueue = async (eventPayload) => {
  const response = await apiClient.post('/sync/offline-queue', eventPayload);
  return response.data;
};