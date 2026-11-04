import React, { createContext, useContext, useEffect, useState } from 'react';
import { platformApi } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, playerId?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(!user && !!token);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      localStorage.removeItem('auth_user');
      setIsLoading(false);
      return;
    }

    try {
      const res = await platformApi.getMe();
      if (res.data?.success && res.data?.user) {
        const u = res.data.user;
        const updatedUser: User = {
          id: u.id,
          username: u.username,
          email: u.email,
          playerId: u.playerId || u.player_id || null,
          walletBalance: parseFloat(u.walletBalance || 0),
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      // Only log out if specifically 401 or 403 (invalid token), not network timeout
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('Session expired or invalid token');
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await platformApi.login({ usernameOrEmail, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      const newUser: User = {
        id: receivedUser.id,
        username: receivedUser.username,
        email: receivedUser.email,
        playerId: receivedUser.playerId || receivedUser.player_id || null,
        walletBalance: parseFloat(receivedUser.walletBalance || 0),
      };
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      setToken(receivedToken);
      setUser(newUser);
      setIsAuthModalOpen(false);
    }
  };

  const register = async (username: string, email: string, password: string, playerId?: string) => {
    const res = await platformApi.register({ username, email, password, playerId });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      const newUser: User = {
        id: receivedUser.id,
        username: receivedUser.username,
        email: receivedUser.email,
        playerId: receivedUser.playerId || receivedUser.player_id || null,
        walletBalance: parseFloat(receivedUser.walletBalance || 0),
      };
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      setToken(receivedToken);
      setUser(newUser);
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const updateUserBalance = (newBalance: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, walletBalance: newBalance };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        updateUserBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
