import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setBusiness(res.data.data.business);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData, business: bizData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    setBusiness(bizData);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user: userData, business: bizData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
    setBusiness(bizData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setBusiness(null);
  };

  const updateBusiness = (newBiz) => {
    setBusiness(newBiz);
  };

  return (
    <AuthContext.Provider value={{
      user, business, loading,
      login, register, logout, loadProfile, updateBusiness,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
