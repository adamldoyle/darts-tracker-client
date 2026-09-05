import { FC } from 'react';
import { Card, CardHeader, CardContent, makeStyles, Box } from '@material-ui/core';
import { selectors as leagueSelectors } from 'store/leagues/slice';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 350,
  },
  clickableCard: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.grey[400],
    },
  },
}));

export interface RankingCardProps {
  title: string;
  rankings: [string, string | number][];
  onClick?: () => void;
}

export const RankingCard: FC<RankingCardProps> = ({ title, rankings, onClick }) => {
  const classes = useStyles();
  const playerDisplayMap = useSelector(leagueSelectors.selectPlayerDisplayMap);
  return (
    <Card className={`${classes.card} ${onClick ? classes.clickableCard : ''}`} onClick={onClick}>
      <CardHeader title={title} />
      <CardContent>
        <ol>
          {rankings.map(([email, value], rankingIdx) => (
            <li key={rankingIdx} style={{ backgroundColor: rankingIdx % 2 ? '#E6E6E6' : undefined}}>
              <Box display="flex" justifyContent="space-between">
                <span>{playerDisplayMap?.[email] ?? email} - </span>
                <span>{value}</span>
              </Box>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
