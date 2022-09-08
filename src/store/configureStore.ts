import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { reducer as authReducer } from './auth/slice';
import { reducer as leaguesReducer } from './leagues/slice';
import { reducer as leagueGamesReducer } from './games/slice';

export const rootReducer = combineReducers({
  auth: authReducer,
  leagues: leaguesReducer,
  games: leagueGamesReducer,
});
const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['auth', 'games'],
  },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});
