import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

export interface OwnedToken {
  tokenId: string;
  tokenURI: string;
  owner: string;
}

export interface ContractInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

export interface MintRecord {
  id: string;
  tokenId: string;
  tokenURI: string;
  owner: string;
  txHash: string;
  mintedAt: string;
}

interface ContractState {
  info: ContractInfo | null;
  ownedTokens: OwnedToken[];
  history: MintRecord[];
  historyLoading: boolean;
  minting: boolean;
  pendingTxHash: string | null;
  mintTxHash: string | null;
  mintTokenId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContractState = {
  info: null,
  ownedTokens: [],
  history: [],
  historyLoading: false,
  minting: false,
  pendingTxHash: null,
  mintTxHash: null,
  mintTokenId: null,
  loading: false,
  error: null,
};

export const fetchContractInfo = createAsyncThunk(
  "contract/fetchInfo",
  async ({ apiBase }: { apiBase: string }) => {
    const res = await fetch(`${apiBase}/api/contracts/info`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error ?? "Failed to fetch contract info");
    return json.data as ContractInfo;
  },
);

export const fetchOwnedTokens = createAsyncThunk(
  "contract/fetchOwnedTokens",
  async ({ address, apiBase }: { address: string; apiBase: string }) => {
    const res = await fetch(`${apiBase}/api/contracts/tokens/${address}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error ?? "Failed to fetch owned tokens");
    return json.data as OwnedToken[];
  },
);

export const fetchMintHistory = createAsyncThunk(
  "contract/fetchHistory",
  async ({ apiBase }: { apiBase: string }) => {
    const res = await fetch(`${apiBase}/api/contracts/history`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (!json.success)
      throw new Error(json.error ?? "Failed to fetch mint history");
    return json.data as MintRecord[];
  },
);

export const saveMintRecord = createAsyncThunk(
  "contract/saveRecord",
  async ({
    apiBase,
    tokenId,
    tokenURI,
    owner,
    txHash,
  }: {
    apiBase: string;
    tokenId: string;
    tokenURI: string;
    owner: string;
    txHash: string;
  }) => {
    const res = await fetch(`${apiBase}/api/contracts/record`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tokenId, tokenURI, owner, txHash }),
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to save record");
    return json.data as MintRecord;
  },
);

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    setMinting(state) {
      state.minting = true;
      state.error = null;
      state.pendingTxHash = null;
      state.mintTxHash = null;
      state.mintTokenId = null;
    },
    setPendingTx(state, action: PayloadAction<string>) {
      state.pendingTxHash = action.payload;
    },
    setMintSuccess(
      state,
      action: PayloadAction<{ txHash: string; tokenId: string }>,
    ) {
      state.minting = false;
      state.pendingTxHash = null;
      state.mintTxHash = action.payload.txHash;
      state.mintTokenId = action.payload.tokenId;
    },
    setMintError(state, action: PayloadAction<string>) {
      state.minting = false;
      state.pendingTxHash = null;
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetMint(state) {
      state.minting = false;
      state.pendingTxHash = null;
      state.mintTxHash = null;
      state.mintTokenId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContractInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchContractInfo.fulfilled,
        (state, action: PayloadAction<ContractInfo>) => {
          state.loading = false;
          state.info = action.payload;
        },
      )
      .addCase(fetchContractInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      })
      .addCase(fetchOwnedTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOwnedTokens.fulfilled,
        (state, action: PayloadAction<OwnedToken[]>) => {
          state.loading = false;
          state.ownedTokens = action.payload;
        },
      )
      .addCase(fetchOwnedTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unknown error";
      })
      .addCase(fetchMintHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(
        fetchMintHistory.fulfilled,
        (state, action: PayloadAction<MintRecord[]>) => {
          state.historyLoading = false;
          state.history = action.payload;
        },
      )
      .addCase(fetchMintHistory.rejected, (state) => {
        state.historyLoading = false;
      })
      .addCase(
        saveMintRecord.fulfilled,
        (state, action: PayloadAction<MintRecord>) => {
          state.history = [action.payload, ...state.history];
        },
      );
  },
});

export const contractActions = contractSlice.actions;
export default contractSlice.reducer;
