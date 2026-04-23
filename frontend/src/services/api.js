import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://bookstacker.onrender.com/api');

// Remove trailing slash if it exists
const cleanBaseURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

const api = axios.create({
  baseURL: cleanBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000, // Increased timeout for Render cold starts
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. The server may be starting up, please try again.';
    }
    return Promise.reject(error);
  }
);

export default api;
