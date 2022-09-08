import { FC } from 'react';
import { Card, CardHeader, CardContent, makeStyles } from '@material-ui/core';

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
  return (
    <Card className={`${classes.card} ${onClick ? classes.clickableCard : ''}`} onClick={onClick}>
      <CardHeader title={title} />
      <CardContent>
        <ol>
          {rankings.map(([email, value], rankingIdx) => (
            <li key={rankingIdx}>
              {email} - {value}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
