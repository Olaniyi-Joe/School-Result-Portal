import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContextDef';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, ''); // Ensure no trailing slash

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${BASE_URL}/auth/token/`, { // Added trailing slash
      email,
      password
    });
    
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    const userResponse = await axios.get(`${BASE_URL}/auth/users/me`); // Removed trailing slash
    const userData = userResponse.data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Use a timeout to ensure the user state is updated before navigating
    setTimeout(() => {
      if (userData.role === 'TEACHER') {
        navigate('/teacher-home');
      } else {
        navigate('/');
      }
    }, 0);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      const response = await axios.post(`${BASE_URL}/auth/token/refresh`, { // Removed trailing slash
        refresh
      });
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return access;
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};