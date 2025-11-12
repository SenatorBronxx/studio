
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useLanguage } from './language-context';

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
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'amount'> & { amount: number }) => void;
  removeTransaction: (id: string) => void;
  addLoyaltyPoints: (points: number) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  {
    id: uuidv4(),
    type: 'payment',
    plate: 'GT 4589-23',
    amount: -75.0,
  },
  {
    id: uuidv4(),
    type: 'payment',
    plate: 'AS 1234-24',
    amount: -55.0,
  },
  {
    id: uuidv4(),
    type: 'payment',
    plate: 'GN 2020-21',
    amount: -80.0,
  },
];

const INITIAL_BALANCE = 250.00;
const INITIAL_LOYALTY_POINTS = 500;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(INITIAL_LOYALTY_POINTS);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();
  const lowBalanceThreshold = 10.00;
  const [hasShownLowBalanceWarning, setHasShownLowBalanceWarning] = useState(false);

  useEffect(() => {
    try {
      const storedBalance = localStorage.getItem('eritas-wallet-balance');
      if (storedBalance) {
        setBalance(parseFloat(storedBalance));
      }

      const storedTransactions = localStorage.getItem('eritas-wallet-transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }

      const storedLoyaltyPoints = localStorage.getItem('eritas-loyalty-points');
      if (storedLoyaltyPoints) {
        setLoyaltyPoints(parseInt(storedLoyaltyPoints, 10));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-wallet-balance', balance.toString());
        localStorage.setItem('eritas-loyalty-points', loyaltyPoints.toString());
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }
  }, [balance, loyaltyPoints, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-wallet-transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to write transactions to localStorage", error);
      }
    }
  }, [transactions, isHydrated]);

  useEffect(() => {
    if (isHydrated && isOnline) {
      if (balance < lowBalanceThreshold) {
        if (!hasShownLowBalanceWarning) {
          toast({
            variant: 'destructive',
            title: t('lowBalanceWarningToastTitle'),
            description: t('lowBalanceWarningToastDescription'),
          });
          setHasShownLowBalanceWarning(true);
        }
      } else {
        setHasShownLowBalanceWarning(false);
      }
    }
  }, [balance, isHydrated, toast, isOnline, hasShownLowBalanceWarning, t]);

  const deductBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance - amount);
  };
  
  const addBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance + amount);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };
  
  const removeTransaction = (id: string) => {
    setTransactions((prevTransactions) => prevTransactions.filter(tx => tx.id !== id));
  };
  
  const addLoyaltyPoints = useCallback((points: number) => {
    setLoyaltyPoints(prev => prev + points);
  }, []);
  
  const value = { balance, transactions, loyaltyPoints, deductBalance, addBalance, addTransaction, removeTransaction, addLoyaltyPoints };

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
