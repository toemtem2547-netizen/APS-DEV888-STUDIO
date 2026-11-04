import React, { createContext, useContext, useState, useEffect } from 'react';
import { platformApi } from '../services/api';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  isTopupModalOpen: boolean;
  openTopupModal: () => void;
  closeTopupModal: () => void;
  refreshBalance: () => Promise<void>;
  topup: (amount: number, method?: string) => Promise<{ newBalance: number; message: string }>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateUserBalance } = useAuth();
  const [balance, setBalance] = useState<number>(user?.walletBalance || 0);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setBalance(user.walletBalance);
    } else {
      setBalance(0);
    }
  }, [user]);

  const refreshBalance = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await platformApi.getWalletBalance();
      if (res.data?.success && res.data?.data) {
        const bal = parseFloat(res.data.data.balance || 0);
        setBalance(bal);
        updateUserBalance(bal);
      }
    } catch (err) {
      console.warn('Failed to refresh wallet balance');
    }
  };

  const topup = async (amount: number, method = 'PROMPTPAY') => {
    const res = await platformApi.topupWallet(amount, method);
    if (res.data?.success) {
      const newBal = parseFloat(res.data.data.newBalance);
      setBalance(newBal);
      updateUserBalance(newBal);
      return { newBalance: newBal, message: res.data.message };
    }
    throw new Error(res.data?.message || 'Topup failed');
  };

  const openTopupModal = () => setIsTopupModalOpen(true);
  const closeTopupModal = () => setIsTopupModalOpen(false);

  return (
    <WalletContext.Provider
      value={{
        balance,
        isTopupModalOpen,
        openTopupModal,
        closeTopupModal,
        refreshBalance,
        topup,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
