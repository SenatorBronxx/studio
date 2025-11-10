
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Transaction = {
  id: string;
  type: 'payment' | 'top-up';
  plate: string;
  amount: number;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'amount'> & { amount: number }) => void;
  removeTransaction: (id: string) => void;
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

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isHydrated, setIsHydrated] = useState(false);

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
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-wallet-balance', balance.toString());
      } catch (error) {
        console.error("Failed to write balance to localStorage", error);
      }
    }
  }, [balance, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('eritas-wallet-transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to write transactions to localStorage", error);
      }
    }
  }, [transactions, isHydrated]);


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
  
  if (!isHydrated) {
    return null; 
  }


  return (
    <WalletContext.Provider value={{ balance, transactions, deductBalance, addBalance, addTransaction, removeTransaction }}>
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
