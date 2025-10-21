import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (token) {
          const data = await api.me();
          if (mounted) {
            setUser(data.user);
            setOrg(data.org);
          }
        }
      } catch (e) {
        // Ignore; api.me handles redirect on 401
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function visitorLogin(email) {
  const data = await api.visitorLogin(email);
  if (!data || !data.token) throw new Error('Login failed');
  localStorage.setItem('token', data.token);
  setToken(data.token);
  setUser(data.user);
  setOrg(data.org);
  return data;
}

  async function login(email, password) {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    console.log('Login data:', data);
    setToken(data.token);
    setUser(data.user);
    setOrg(data.org);
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrg(null);
    window.location.href = '/login';
  }

  const value = { token, user, org, loading, login, logout ,visitorLogin};
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}