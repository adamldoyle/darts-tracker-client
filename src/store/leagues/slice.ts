import { createSelector, PayloadAction } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import { IRootState } from 'store/types';
import { createMonitoredSlice } from '@adamldoyle/reduxjs-toolkit-monitored-slice';
import { selectEmail } from '../auth/slice';
import { ILeague, ILeaguesState, ILeagueWithMembers } from './types';
import { displayName, getPlayerColor } from '../../shared/utils/player';

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
export const selectLeaguePlayerEmails = createSelector(baseSelectors.selectSlice, (slice) => slice.selectedLeague?.membership.map((mp) => mp.email) ?? [])
export const selectEloKFactor = createSelector(
  baseSelectors.selectSlice,
  (slice) => slice.eloKFactor ?? DEFAULT_K_FACTOR,
);
export const selectPlayerColorMap = createSelector(baseSelectors.selectSlice, (slice) => slice.selectedLeague?.membership.reduce<Record<string, string>>((acc, player, index) => {
  acc[player.email] = player.colorCode ? player.colorCode : getPlayerColor(player.email, index);
  return acc;
}, {}))
export const selectPlayerDisplayMap = createSelector(baseSelectors.selectSlice, (slice) => slice.selectedLeague?.membership.reduce<Record<string, string>>((acc, player, index) => {
  acc[player.email] = player.displayName ? player.displayName : displayName(player.email);
  return acc;
}, {}))

const actions = slice.actions;
const reducer = slice.reducer;
const selectors = { ...baseSelectors, selectSelectedLeague, selectEloKFactor, selectLeaguePlayerEmails, selectPlayerColorMap, selectPlayerDisplayMap };
export { selectors, actions, hooks, context, reducer };
