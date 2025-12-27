
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
  clearTransactions: () => void;
  isHydrated: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialBalance = 200.00;

export function WalletProvider({ children }: { children: ReactNode }) {
    const [balance, setBalance] = useState(initialBalance);
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
                localStorage.setItem('walletBalance', JSON.stringify(initialBalance));
            }

            if (storedTransactions) {
                setTransactions(JSON.parse(storedTransactions));
            } else {
                localStorage.setItem('walletTransactions', JSON.stringify([]));
            }
        } catch (error) {
            console.error("Failed to load wallet data from localStorage", error);
            setBalance(initialBalance);
            setTransactions([]);
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

        const newBalance = balance + newTransaction.amount;
        const newTransactions = [newTransaction, ...transactions];

        setBalance(newBalance);
        setTransactions(newTransactions);
        updateLocalStorage(newBalance, newTransactions);

        if (newBalance < 20 && newBalance > 0) {
            toast({
                variant: 'destructive',
                title: "Low Balance Warning",
                description: 'Your wallet balance is getting low. Please top-up.',
            });
        }
    }, [balance, transactions, toast]);

    const clearTransactions = useCallback(() => {
        setTransactions([]);
        try {
            localStorage.setItem('walletTransactions', JSON.stringify([]));
            toast({
                title: "History Cleared",
                description: "Your transaction history has been cleared.",
            });
        } catch (error) {
            console.error("Failed to clear transactions from localStorage", error);
        }
    }, [toast]);

    const value = { balance, transactions, addTransaction, clearTransactions, isHydrated };

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
