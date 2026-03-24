import { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();
const INACTIVITY_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const markActivity = () => localStorage.setItem('lastActivityAt', String(Date.now()));
    const events = ['click', 'keydown', 'mousemove', 'scroll'];

    events.forEach((eventName) => window.addEventListener(eventName, markActivity));

    const token = localStorage.getItem('token');
    const lastActivityAt = Number(localStorage.getItem('lastActivityAt') || Date.now());

    if (!token || Date.now() - lastActivityAt > INACTIVITY_MS) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivityAt');
      setUser(null);
    } else {
      markActivity();
    }

    const interval = window.setInterval(() => {
      const activeToken = localStorage.getItem('token');
      const activeAt = Number(localStorage.getItem('lastActivityAt') || Date.now());
      if (activeToken && Date.now() - activeAt > INACTIVITY_MS) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivityAt');
        setUser(null);
        window.location.href = '/login';
      }
    }, 60000);

    setIsReady(true);

    return () => {
      window.clearInterval(interval);
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
    };
  }, []);

  const storeSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('lastActivityAt', String(Date.now()));
    setUser(data.user);
  };

  const login = async (identifier, password) => {
    const { data } = await API.post('/auth/login', { identifier, password });
    storeSession(data);
    return data.user;
  };

  const register = async (name, username, email, password) => {
    const { data } = await API.post('/auth/register', { name, username, email, password });
    storeSession(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivityAt');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
