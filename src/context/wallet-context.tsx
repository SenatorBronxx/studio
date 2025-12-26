
'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export type Transaction = {
  id: string;
  type: 'top-up' | 'payment';
  amount: number;
  description: string;
  timestamp: string;
  plate?: string;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  isHydrated: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialBalance = 200.00; // Starting balance for the local-only version

const initialTransactions: Transaction[] = [
    {
        id: uuidv4(),
        type: 'top-up',
        amount: 50.00,
        description: 'Initial balance load',
        timestamp: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        type: 'payment',
        amount: -12.00,
        description: 'Trip on bus GT 4589-23',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        plate: 'GT 4589-23',
    }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedBalance = localStorage.getItem('walletBalance');
        const storedTransactions = localStorage.getItem('walletTransactions');
        
        if (storedBalance) {
            setBalance(JSON.parse(storedBalance));
        } else {
            setBalance(initialBalance);
            localStorage.setItem('walletBalance', JSON.stringify(initialBalance));
        }

        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        } else {
            setTransactions(initialTransactions);
            localStorage.setItem('walletTransactions', JSON.stringify(initialTransactions));
        }
    } catch (error) {
        console.error("Failed to load wallet data from localStorage", error);
        setBalance(initialBalance);
        setTransactions(initialTransactions);
    }
    setIsHydrated(true);
  }, []);

  const updateLocalStorage = (newBalance: number, newTransactions: Transaction[]) => {
      try {
          localStorage.setItem('walletBalance', JSON.stringify(newBalance));
          localStorage.setItem('walletTransactions', JSON.stringify(newTransactions));
      } catch (error) {
           console.error("Failed to save wallet data to localStorage", error);
           toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'Could not save wallet data.',
           });
      }
  };

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
        ...transaction,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
    };

    setBalance(prevBalance => {
        const newBalance = prevBalance + newTransaction.amount;
        
        setTransactions(prevTransactions => {
            const newTransactions = [newTransaction, ...prevTransactions];
            updateLocalStorage(newBalance, newTransactions);
            return newTransactions;
        });

        if (newBalance < 20 && newBalance > 0) {
            toast({
                variant: 'destructive',
                title: "Low Balance Warning",
                description: 'Your wallet balance is getting low. Please top-up.',
            });
        }
        return newBalance;
    });
  }, [toast]);
  
  const value = { balance, transactions, addTransaction, isHydrated };

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
