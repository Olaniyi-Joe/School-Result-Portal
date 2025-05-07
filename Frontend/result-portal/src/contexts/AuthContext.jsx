import { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContextDef';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const response = await axios.post('http://localhost:8000/api/auth/token/', {
      email,
      password
    });
    
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    const userResponse = await axios.get('http://localhost:8000/api/auth/users/me/');
    localStorage.setItem('user', JSON.stringify(userResponse.data));
    setUser(userResponse.data);
    return userResponse.data;
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
      const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
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