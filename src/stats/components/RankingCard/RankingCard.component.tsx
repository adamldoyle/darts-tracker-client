import { FC } from 'react';
import { Card, CardHeader, CardContent, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  card: {
    minWidth: 350,
  },
}));

export interface RankingCardProps {
  title: string;
  rankings: [string, string | number][];
}

export const RankingCard: FC<RankingCardProps> = ({ title, rankings }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardHeader title={title} />
      <CardContent>
        <ol>
          {rankings.map(([email, value]) => (
            <li key={email}>
              {email} - {value}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
