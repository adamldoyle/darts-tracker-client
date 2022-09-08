import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
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
import { hooks, selectors } from 'store/games/slice';

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
  const { loading: gamesLoading } = hooks.useMonitoredData();
  const { eloHistory, finalElo } = useSelector(selectors.selectEloHistory);

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
          scales: {
            y: {
              // beginAtZero: true,
              // min: 0,
              // max: 10,
            },
          },
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
