
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-context';
import { useUserPreferences } from './user-preferences-context';

type Transaction = {
  id: string;
  type: 'payment' | 'top-up';
  plate: string;
  amount: number;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  loyaltyPoints: number;
  isLowBalance: boolean;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'amount'> & { amount: number }) => void;
  removeTransaction: (id: string) => void;
  addLoyaltyPoints: (points: number) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LOW_BALANCE_THRESHOLD = 10.00;


export function WalletProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();
  const { toast } = useToast();
  const { t } = useLanguage();

  const balance = preferences?.walletBalance || 0;
  const transactions = preferences?.transactions || [];
  const loyaltyPoints = preferences?.loyaltyPoints || 0;
  const isLowBalance = balance < LOW_BALANCE_THRESHOLD;

  const deductBalance = (amount: number) => {
    setPreference('walletBalance', balance - amount);
  };
  
  const addBalance = (amount: number) => {
    setPreference('walletBalance', balance + amount);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setPreference('transactions', [newTransaction, ...transactions]);
  };
  
  const removeTransaction = (id: string) => {
    const newTransactions = transactions.filter(tx => tx.id !== id);
    setPreference('transactions', newTransactions);
  };
  
  const addLoyaltyPoints = useCallback((points: number) => {
    setPreference('loyaltyPoints', loyaltyPoints + points);
  }, [loyaltyPoints, setPreference]);
  
  const value = { balance, transactions, loyaltyPoints, deductBalance, addBalance, addTransaction, removeTransaction, addLoyaltyPoints, isLowBalance };

  if (!isHydrated) {
    return null; 
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
