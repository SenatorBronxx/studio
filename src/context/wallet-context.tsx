
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  addTransaction: (transaction: Transaction) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'payment',
    plate: 'GT 4589-23',
    amount: -75.0,
  },
  {
    id: 'txn-2',
    type: 'payment',
    plate: 'AS 1234-24',
    amount: -55.0,
  },
  {
    id: 'txn-3',
    type: 'payment',
    plate: 'GN 2020-21',
    amount: -80.0,
  },
];

const getInitialBalance = () => {
    if (typeof window === 'undefined') return 250.00;
    const storedBalance = localStorage.getItem('eritas-wallet-balance');
    return storedBalance ? parseFloat(storedBalance) : 250.00;
};

const getInitialTransactions = () => {
    if (typeof window === 'undefined') return initialTransactions;
    const storedTransactions = localStorage.getItem('eritas-wallet-transactions');
    return storedTransactions ? JSON.parse(storedTransactions) : initialTransactions;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(getInitialBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);

  useEffect(() => {
    localStorage.setItem('eritas-wallet-balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('eritas-wallet-transactions', JSON.stringify(transactions));
  }, [transactions]);


  const deductBalance = (amount: number) => {
    setBalance((prevBalance) => prevBalance - amount);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prevTransactions) => [transaction, ...prevTransactions]);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, deductBalance, addTransaction }}>
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
