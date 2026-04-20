import axios from 'axios';
import { auth } from './firebase';

// Use network IP so mobile devices can reach the API
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://bookstacker.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
