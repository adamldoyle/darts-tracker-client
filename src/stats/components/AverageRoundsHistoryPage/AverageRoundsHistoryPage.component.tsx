import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@material-ui/core';
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

export interface AverageRoundsHistoryPageProps {}

export const AverageRoundsHistoryPage: FC<AverageRoundsHistoryPageProps> = () => {
  const { loading: gamesLoading } = gamesHooks.useMonitoredData();
  const roundsHistory = useSelector(gamesSelectors.selectAverageRoundsPlayedHistory);
  const selectedLeague = useSelector(leagueSelectors.selectSelectedLeague);

  const sortedRoundsHistory = Object.entries(roundsHistory).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  const allEmails = Array.from(
    new Set(
      Object.values(roundsHistory)
        .map((monthRounds) => Object.keys(monthRounds))
        .flat(),
    ),
  ).sort((a, b) => a.localeCompare(b));

  if (gamesLoading || !selectedLeague) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <Box style={{ maxWidth: '80%' }}>
      <Line
        height={200}
        data={{
          labels: sortedRoundsHistory.map(([month]) => month),
          datasets: allEmails.map((email, emailIdx) => ({
            label: email,
            data: sortedRoundsHistory.map(([, monthAverages]) => monthAverages[email]),
            backgroundColor: colors[emailIdx % colors.length],
            borderColor: colors[emailIdx % colors.length],
          })),
        }}
        options={{
          indexAxis: 'x',
          spanGaps: true,
        }}
      />
    </Box>
  );
};
