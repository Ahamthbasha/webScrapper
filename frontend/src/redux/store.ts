// store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import userReducer from './slices/userSlice';

// Define proper types for the storage object
interface StorageValue {
  userId: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
}

const storage = {
  getItem: (key: string): Promise<StorageValue | null> => {
    const value = localStorage.getItem(key);
    if (!value) return Promise.resolve(null);
    
    try {
      const parsed = JSON.parse(value) as StorageValue;
      return Promise.resolve(parsed);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: StorageValue): Promise<void> => {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const userPersistConfig = { key: "user", storage };

const rootReducers = combineReducers({
  user: persistReducer(userPersistConfig, userReducer)
});

const store = configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
export default store;