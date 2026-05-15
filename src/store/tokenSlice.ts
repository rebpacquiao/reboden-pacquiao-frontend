import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

export interface Token {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string | null;
  balance: string;
}

interface TokenState {
  tokens: Token[];
  count: number;
  loading: boolean;
  error: string | null;
  address: string | null;
  fetchedAt: string | null;
}

const initialState: TokenState = {
  tokens: [],
  count: 0,
  loading: false,
  error: null,
  address: null,
  fetchedAt: null,
};

export const fetchTokens = createAsyncThunk(
  "tokens/fetch",
  async ({ address, apiBase }: { address: string; apiBase: string }) => {
    const res = await fetch(
      `${apiBase}/api/ethereum/account/${address}/tokens`,
    );
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to fetch tokens");
    return { ...json.data, address } as TokenState & { address: string };
  },
);

const tokenSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    resetTokens(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTokens.fulfilled,
        (state, action: PayloadAction<TokenState & { address: string }>) => {
          state.loading = false;
          state.tokens = action.payload.tokens;
          state.count = action.payload.count;
          state.address = action.payload.address;
          state.fetchedAt = action.payload.fetchedAt;
        },
      )
      .addCase(fetchTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export const tokenActions = tokenSlice.actions;
export default tokenSlice.reducer;
