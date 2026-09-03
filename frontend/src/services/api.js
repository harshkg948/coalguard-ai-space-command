import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1', // Vite proxy automatically routes this to http://127.0.0.1:8000/api/v1
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