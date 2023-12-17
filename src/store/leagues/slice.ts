import { createSelector, PayloadAction } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import { IRootState } from 'store/types';
import { createMonitoredSlice } from '@adamldoyle/reduxjs-toolkit-monitored-slice';
import { selectEmail } from '../auth/slice';
import { ILeague, ILeaguesState, ILeagueWithMembers } from './types';

const DEFAULT_K_FACTOR = 10;

const { slice, selectors: baseSelectors, hooks, context } = createMonitoredSlice<
  IRootState,
  ILeague[],
  ILeaguesState,
  string | null
>(
  {
    name: 'leagues',
    initialState: {
      selectedLeague: null,
      eloKFactor: DEFAULT_K_FACTOR,
    },
    reducers: {
      selectLeague: (state, action: PayloadAction<ILeagueWithMembers>) => {
        state.selectedLeague = action.payload;
      },
      setEloKFactor: (state, action: PayloadAction<number>) => {
        state.eloKFactor = action.payload;
      },
    },
  },
  [],
  async (email) => {
    if (!email) {
      return [];
    }

    const { leagues } = (await API.get('leagues', '/leagues', {})) as { leagues: ILeague[] };
    leagues.sort((a, b) => a.name.localeCompare(b.name));
    return leagues;
  },
  selectEmail,
);

export const selectSelectedLeague = createSelector(baseSelectors.selectSlice, (slice) => slice.selectedLeague);
export const selectEloKFactor = createSelector(
  baseSelectors.selectSlice,
  (slice) => slice.eloKFactor ?? DEFAULT_K_FACTOR,
);

const actions = slice.actions;
const reducer = slice.reducer;
const selectors = { ...baseSelectors, selectSelectedLeague, selectEloKFactor };
export { selectors, actions, hooks, context, reducer };
