import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { hooks as gamesHooks, selectors as gamesSelectors } from 'store/games/slice';
import { selectors as leagueSelectors, actions as leagueActions } from 'store/leagues/slice';
import { DEFAULT_ELO } from 'store/games/elo';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface EloHistoryPageProps {}

export const EloHistoryPage: FC<EloHistoryPageProps> = () => {
  const dispatch = useDispatch();
  const { loading: gamesLoading } = gamesHooks.useMonitoredData();
  const { eloHistory, finalElo } = useSelector(gamesSelectors.selectEloHistory);

  const eloRankings = useSelector(gamesSelectors.selectEloRankings);
  const selectedLeague = useSelector(leagueSelectors.selectSelectedLeague);
  const playerColorMap = useSelector(leagueSelectors.selectPlayerColorMap);
  const playerDisplayMap = useSelector(leagueSelectors.selectPlayerDisplayMap);
  const eloKFactor = useSelector(leagueSelectors.selectEloKFactor);

  const reversedEloHistory = [...eloHistory].reverse();

  if (gamesLoading || !selectedLeague) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <TableContainer>
      ELO K-factor:{' '}
      <input
        type="number"
        value={eloKFactor}
        onChange={(evt) => {
          dispatch(leagueActions.setEloKFactor(evt.target.value));
        }}
      />
      <Box style={{ maxWidth: '80%' }}>
        <Line
          height={200}
          data={{
            labels: ['', ...eloHistory.map(({ datePlayed }) => new Date(datePlayed).toDateString())],
            datasets: Object.keys(finalElo)
              .sort((a, b) => a.localeCompare(b))
              .map((email, emailIdx) => ({
                label: `${playerDisplayMap?.[email] ?? email} (${finalElo[email]}, rank ${
                  eloRankings.findIndex((value) => value[0] === email) + 1
                })`,
                data: [DEFAULT_ELO, ...eloHistory.map(({ elos }) => elos[email])],
                backgroundColor: `#${playerColorMap?.[email]}`,
                borderColor: `#${playerColorMap?.[email]}`,
              })),
          }}
          options={{
            indexAxis: 'x',
            spanGaps: true,
          }}
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Rankings</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reversedEloHistory.map(({ datePlayed, elos }) => (
            <TableRow key={datePlayed}>
              <TableCell>{new Date(datePlayed).toDateString()}</TableCell>
              <TableCell>
                {Object.entries(elos)
                  .sort((a, b) => (a[1] < b[1] ? 1 : -1))
                  .map(([email, elo]) => `${email}: ${elo}`)
                  .join(', ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
