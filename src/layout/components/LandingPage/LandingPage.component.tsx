import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  List as ListIcon,
  Equalizer as EqualizerIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  card: {
    width: 300,
    height: 300,
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.grey[400],
    },
  },
  cardContent: {
    height: '100%',
  },
  cardIcon: {
    fontSize: 80,
  },
  cardText: {
    fontSize: 40,
  },
}));

export interface LandingPageProps {}

const LandingPageButton = ({ Icon, text, onClick }: { Icon: any; text: string; onClick: () => void }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} onClick={onClick}>
      <CardContent className={classes.cardContent}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          className={classes.cardContent}
        >
          <Icon className={classes.cardIcon} />
          <Typography className={classes.cardText}>{text}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export const LandingPage: FC<LandingPageProps> = () => {
  const history = useHistory();

  const goTo = (location: string) => {
    history.push(location);
  };

  return (
    <Box display="flex" flexWrap="wrap" gridGap={12} justifyContent="center">
      <LandingPageButton Icon={AddCircleOutlineIcon} text="New game" onClick={() => goTo('/game')} />
      <LandingPageButton Icon={ListIcon} text="Games" onClick={() => goTo('/games')} />
      <LandingPageButton Icon={EqualizerIcon} text="Stats" onClick={() => goTo('/stats')} />
    </Box>
  );
};
