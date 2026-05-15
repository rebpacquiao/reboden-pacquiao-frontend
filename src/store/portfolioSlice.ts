import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Token } from "./tokenSlice";

interface PortfolioState {
  ethBalance: string | null;
  ethUnit: "ETH";
  tokens: Token[];
  tokenCount: number;
  loading: boolean;
  error: string | null;
  address: string | null;
  fetchedAt: string | null;
}

const initialState: PortfolioState = {
  ethBalance: null,
  ethUnit: "ETH",
  tokens: [],
  tokenCount: 0,
  loading: false,
  error: null,
  address: null,
  fetchedAt: null,
};

export const fetchPortfolio = createAsyncThunk(
  "portfolio/fetch",
  async ({ address, apiBase }: { address: string; apiBase: string }) => {
    const res = await fetch(
      `${apiBase}/api/ethereum/account/${address}/portfolio`,
    );
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error ?? "Failed to fetch portfolio");
    return { ...json.data, address } as PortfolioState & { address: string };
  },
);

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    resetPortfolio(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPortfolio.fulfilled,
        (
          state,
          action: PayloadAction<PortfolioState & { address: string }>,
        ) => {
          state.loading = false;
          state.ethBalance = action.payload.ethBalance;
          state.tokens = action.payload.tokens;
          state.tokenCount = action.payload.tokenCount;
          state.address = action.payload.address;
          state.fetchedAt = action.payload.fetchedAt;
        },
      )
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export const portfolioActions = portfolioSlice.actions;
export default portfolioSlice.reducer;
