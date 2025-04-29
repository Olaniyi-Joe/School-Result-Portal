import axios from 'axios';

// Determine the base URL from environment variables
// Make sure VITE_API_BASE_URL is defined in your .env file (e.g., VITE_API_BASE_URL=http://localhost:8000/api)
// Note: If using Create React App, the variable name should start with REACT_APP_ (e.g., REACT_APP_API_BASE_URL)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'; // Fallback for safety

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000, // Optional: Set a request timeout (e.g., 10 seconds)
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
});

// Optional but Recommended: Add an interceptor to include the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or however you store the token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional but Recommended: Add a response interceptor for handling common errors like 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - redirecting to login.");
      localStorage.removeItem('token'); // Clear potentially invalid token
      // window.location.href = '/login'; // Uncomment or adapt for your routing
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
