import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import walletReducer from "./walletSlice";
import tokenReducer from "./tokenSlice";
import portfolioReducer from "./portfolioSlice";
import contractReducer from "./contractSlice";

const walletPersistConfig = {
  key: "wallet",
  storage,
  whitelist: ["address", "balance", "manuallyDisconnected", "noWallet"],
};

const rootReducer = combineReducers({
  wallet: persistReducer(walletPersistConfig, walletReducer),
  tokens: tokenReducer,
  portfolio: portfolioReducer,
  contract: contractReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
