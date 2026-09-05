import { FC } from 'react';
import { Card, CardHeader, CardContent, makeStyles, Box, Typography } from '@material-ui/core';
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
  lineItemStyle: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
  },
}));

export interface RankingCardProps {
  title: string;
  rankings: [string, string | number][];
  onClick?: () => void;
}

export const RankingCard: FC<RankingCardProps> = ({ title, rankings, onClick }) => {
  const classes = useStyles();
  const playerColorMap = useSelector(leagueSelectors.selectPlayerColorMap);
  const playerDisplayMap = useSelector(leagueSelectors.selectPlayerDisplayMap);
  return (
    <Card className={`${classes.card} ${onClick ? classes.clickableCard : ''}`} onClick={onClick}>
      <CardHeader title={title} />
      <CardContent>
        <ol>
          {rankings.map(([email, value], rankingIdx) => (
            <li className={classes.lineItemStyle} key={rankingIdx} style={{ borderColor: `#${playerColorMap?.[email]}`}}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption">{playerDisplayMap?.[email] ?? email}</Typography>
                <b>{value}</b>
              </Box>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
