import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include Auth token if needed
api.interceptors.request.use(async (config) => {
  // If you want to use Firebase Auth tokens for backend verification:
  // const user = auth.currentUser;
  // if (user) {
  //   const token = await user.getIdToken();
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
