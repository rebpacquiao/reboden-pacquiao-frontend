"use client";
import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import type { Transaction } from "@/types";

const ETHERSCAN_API =
  process.env.NEXT_PUBLIC_ETHERSCAN_API ?? "https://api.etherscan.io/api";
const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  const url = `${ETHERSCAN_API}?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  const data = await res.json();

  if (data.status === "0" && data.message === "No transactions found")
    return [];
  if (data.status !== "1")
    throw new Error(
      data.result || data.message || "Failed to fetch transactions",
    );
  return data.result.slice(0, 10) as Transaction[];
};

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noWallet, setNoWallet] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setNoWallet(true);
      return;
    }
    setNoWallet(false);
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr: string = accounts[0];
      const bal = await provider.getBalance(addr);
      setAddress(addr);
      setBalance(ethers.formatEther(bal));

      try {
        setTransactions(await fetchTransactions(addr));
      } catch (txErr: unknown) {
        setTransactions([]);
        setError(
          txErr instanceof Error
            ? txErr.message
            : "Failed to fetch transactions.",
        );
      }
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
    setNoWallet(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Auto-detect already-connected wallet on mount (no popup)
  useEffect(() => {
    if (!window.ethereum) return;
    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const accounts: string[] = await provider.send("eth_accounts", []);
        if (!accounts.length) return;
        const addr = accounts[0];
        const bal = await provider.getBalance(addr);
        setAddress(addr);
        setBalance(ethers.formatEther(bal));
        try {
          setTransactions(await fetchTransactions(addr));
        } catch (txErr: unknown) {
          setTransactions([]);
          setError(
            txErr instanceof Error
              ? txErr.message
              : "Failed to fetch transactions.",
          );
        }
      } catch {
        // silent — don't show errors on auto-detect
      }
    })();
  }, []);

  return {
    address,
    noWallet,
    balance,
    transactions,
    loading,
    error,
    connect,
    disconnect,
    clearError,
  };
};
