import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Transaction } from "@/types";

interface WalletState {
  address: string | null;
  balance: string | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  noWallet: boolean;
  manuallyDisconnected: boolean;
}

const initialState: WalletState = {
  address: null,
  balance: null,
  transactions: [],
  loading: false,
  error: null,
  noWallet: false,
  manuallyDisconnected: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setConnected(
      state,
      action: PayloadAction<{ address: string; balance: string }>
    ) {
      state.address = action.payload.address;
      state.balance = action.payload.balance;
      state.error = null;
      state.noWallet = false;
      state.manuallyDisconnected = false;
    },
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setNoWallet(state, action: PayloadAction<boolean>) {
      state.noWallet = action.payload;
    },
    disconnect(state) {
      state.address = null;
      state.balance = null;
      state.transactions = [];
      state.error = null;
      state.noWallet = false;
      state.loading = false;
      state.manuallyDisconnected = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const walletActions = walletSlice.actions;
export default walletSlice.reducer;
