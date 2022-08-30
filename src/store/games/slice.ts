import { API } from 'aws-amplify';
import { IRootState } from 'store/types';
import { createMonitoredSlice } from '@adamldoyle/reduxjs-toolkit-monitored-slice';
import { ILeagueWithMembers } from '../leagues/types';
import { selectSelectedLeague } from '../leagues/slice';
import { IGame, ILeagueGamesState } from './types';

const { slice, selectors: baseSelectors, hooks, context } = createMonitoredSlice<
  IRootState,
  IGame[],
  ILeagueGamesState,
  ILeagueWithMembers | null
>(
  {
    name: 'games',
    initialState: {},
    reducers: {},
  },
  [],
  async (selectedLeague) => {
    if (!selectedLeague) {
      return [];
    }

    const { games } = (await API.get('leagues', `/leagues/${selectedLeague.leagueKey}/games`, {})) as {
      games: IGame[];
    };
    games.sort((a, b) => (a.data.config.datePlayed < b.data.config.datePlayed ? 1 : -1));
    return games;
  },
  selectSelectedLeague,
);

const actions = slice.actions;
const reducer = slice.reducer;
const selectors = { ...baseSelectors };
export { selectors, actions, hooks, context, reducer };
