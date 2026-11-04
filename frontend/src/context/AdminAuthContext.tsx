import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { AdminUser } from '../types';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionCode: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(!admin && !!token);

  const fetchCurrentAdmin = async () => {
    const savedToken = localStorage.getItem('admin_token');
    if (!savedToken) {
      setAdmin(null);
      localStorage.removeItem('admin_user');
      setIsLoading(false);
      return;
    }

    try {
      const res = await adminApi.getMe();
      if (res.data?.success && res.data?.admin) {
        setAdmin(res.data.admin);
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('Admin session expired or invalid');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setToken(null);
        setAdmin(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await adminApi.login({ username, password });
    if (res.data?.success) {
      const { token: recToken, admin: recAdmin } = res.data;
      localStorage.setItem('admin_token', recToken);
      localStorage.setItem('admin_user', JSON.stringify(recAdmin));
      setToken(recToken);
      setAdmin(recAdmin);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!admin) return false;
    if (admin.roleName === 'super_admin') return true;
    return admin.permissions?.includes(permissionCode) || false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
