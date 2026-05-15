"use client";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import type { RootState, AppDispatch } from "@/store";
import { walletActions } from "@/store/walletSlice";
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
  const dispatch = useDispatch<AppDispatch>();
  const { address, balance, transactions, loading, error, noWallet, manuallyDisconnected } =
    useSelector((state: RootState) => state.wallet);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      dispatch(walletActions.setNoWallet(true));
      return;
    }
    dispatch(walletActions.setNoWallet(false));
    dispatch(walletActions.setLoading(true));
    dispatch(walletActions.setError(null));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr: string = accounts[0];
      const bal = await provider.getBalance(addr);
      dispatch(
        walletActions.setConnected({
          address: addr,
          balance: ethers.formatEther(bal),
        }),
      );

      try {
        dispatch(walletActions.setTransactions(await fetchTransactions(addr)));
      } catch (txErr: unknown) {
        dispatch(walletActions.setTransactions([]));
        dispatch(
          walletActions.setError(
            txErr instanceof Error
              ? txErr.message
              : "Failed to fetch transactions.",
          ),
        );
      }
    } catch (e: unknown) {
      const code = (e as { code?: string | number })?.code;
      if (code === 4001 || code === "ACTION_REJECTED") {
        dispatch(
          walletActions.setError(
            "Connection rejected. Please approve the MetaMask prompt to connect your wallet.",
          ),
        );
      } else {
        dispatch(
          walletActions.setError(
            e instanceof Error ? e.message : "Wallet connection failed.",
          ),
        );
      }
    } finally {
      dispatch(walletActions.setLoading(false));
    }
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch(walletActions.disconnect());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(walletActions.clearError());
  }, [dispatch]);

  // Auto-detect already-connected wallet on mount (no popup).
  // Skip if: already connected via Redux, OR user explicitly disconnected this session.
  useEffect(() => {
    if (address) return;
    if (manuallyDisconnected) return;
    if (!window.ethereum) return;
    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const accounts: string[] = await provider.send("eth_accounts", []);
        if (!accounts.length) return;
        const addr = accounts[0];
        const bal = await provider.getBalance(addr);
        dispatch(
          walletActions.setConnected({
            address: addr,
            balance: ethers.formatEther(bal),
          }),
        );
        try {
          dispatch(
            walletActions.setTransactions(await fetchTransactions(addr)),
          );
        } catch {
          // silent
        }
      } catch {
        // silent — don't show errors on auto-detect
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
