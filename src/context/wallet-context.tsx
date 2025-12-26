
'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  addLoyaltyPoints: (points: number) => void;
  isHydrated: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LOW_BALANCE_THRESHOLD = 10.00;

export function WalletProvider({ children }: { children: ReactNode }) {
  const { preferences, setPreference, isHydrated } = useUserPreferences();

  const balance = preferences?.walletBalance ?? 0;
  const transactions = preferences?.transactions ?? [];
  const loyaltyPoints = preferences?.loyaltyPoints ?? 0;

  const isLowBalance = balance < LOW_BALANCE_THRESHOLD;

  const deductBalance = useCallback((amount: number) => {
    const currentBalance = preferences?.walletBalance ?? 0;
    const newBalance = currentBalance - amount;
    setPreference('walletBalance', newBalance);
  }, [preferences?.walletBalance, setPreference]);
  
  const addBalance = useCallback((amount: number) => {
    const currentBalance = preferences?.walletBalance ?? 0;
    const newBalance = currentBalance + amount;
    setPreference('walletBalance', newBalance);
  }, [preferences?.walletBalance, setPreference]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const currentTransactions = preferences?.transactions ?? [];
    const newTransaction = { ...transaction, id: uuidv4() };
    const updatedTransactions = [newTransaction, ...currentTransactions];
    setPreference('transactions', updatedTransactions);
  }, [preferences?.transactions, setPreference]);
  
  const removeTransaction = useCallback((id: string) => {
    const currentTransactions = preferences?.transactions ?? [];
    const newTransactions = currentTransactions.filter(tx => tx.id !== id);
    setPreference('transactions', newTransactions);
  }, [preferences?.transactions, setPreference]);
  
  const addLoyaltyPoints = useCallback((points: number) => {
    const currentPoints = preferences?.loyaltyPoints ?? 0;
    setPreference('loyaltyPoints', currentPoints + points);
  }, [preferences?.loyaltyPoints, setPreference]);
  
  const value = { 
    balance, 
    transactions, 
    loyaltyPoints, 
    deductBalance, 
    addBalance, 
    addTransaction, 
    removeTransaction, 
    addLoyaltyPoints, 
    isLowBalance,
    isHydrated
  };

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
