import { FC } from 'react';
import { useSelector } from 'react-redux';
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
import { selectors as leagueSelectors } from 'store/leagues/slice';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const colors = [
  '#8dd3c7',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  '#d9d9d9',
  '#bc80bd',
  '#ccebc5',
  '#ffed6f',
];

export interface EloHistoryPageProps {}

export const EloHistoryPage: FC<EloHistoryPageProps> = () => {
  const { loading: gamesLoading } = gamesHooks.useMonitoredData();
  const { eloHistory, finalElo } = useSelector(gamesSelectors.selectEloHistory);
  const selectedLeague = useSelector(leagueSelectors.selectSelectedLeague);

  if (gamesLoading || !selectedLeague) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <TableContainer>
      <Line
        height={200}
        data={{
          labels: eloHistory.map(({ datePlayed }) => new Date(datePlayed).toDateString()),
          datasets: Object.keys(finalElo).map((email, emailIdx) => ({
            label: email,
            data: eloHistory.map(({ elos }) => elos[email]),
            backgroundColor: colors[emailIdx % colors.length],
            borderColor: colors[emailIdx % colors.length],
          })),
        }}
        options={{
          indexAxis: 'x',
          spanGaps: true,
        }}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Game id</TableCell>
            <TableCell>Rankings</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {eloHistory.map(({ gameId, datePlayed, elos }) => (
            <TableRow key={gameId}>
              <TableCell>{new Date(datePlayed).toDateString()}</TableCell>
              <TableCell>{gameId}</TableCell>
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
