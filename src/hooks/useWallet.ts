"use client";
import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { Transaction } from "@/types";

const ETHERSCAN_API = "https://api.etherscan.io/api";
const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  const url = `${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "1")
    throw new Error(data.message || "Failed to fetch transactions");
  return data.result.slice(0, 10) as Transaction[];
};

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr: string = accounts[0];
      const [bal, txs] = await Promise.all([
        provider.getBalance(addr),
        fetchTransactions(addr).catch(() => [] as Transaction[]),
      ]);
      setAddress(addr);
      setBalance(ethers.formatEther(bal));
      setTransactions(txs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setTransactions([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    address,
    balance,
    transactions,
    loading,
    error,
    connect,
    disconnect,
    clearError,
  };
};
