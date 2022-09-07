import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BottomNavigation, BottomNavigationAction, makeStyles } from '@material-ui/core';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  List as ListIcon,
  Equalizer as EqualizerIcon,
} from '@material-ui/icons';
import { selectors } from 'store/leagues/slice';

const useStyles = makeStyles((theme) => ({
  navigation: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
  },
  disabledAction: {
    color: theme.palette.grey[400],
  },
}));

export interface QuickBarProps {}

export const QuickBar: FC<QuickBarProps> = () => {
  const classes = useStyles();

  const selectedLeague = useSelector(selectors.selectSelectedLeague);

  return (
    <BottomNavigation className={classes.navigation} showLabels>
      <BottomNavigationAction
        component={Link}
        to="/game"
        value="game"
        label="Game"
        icon={<AddCircleOutlineIcon />}
        disabled={selectedLeague === null}
        className={selectedLeague === null ? classes.disabledAction : undefined}
      />
      <BottomNavigationAction
        component={Link}
        to="/games"
        value="games"
        label="Games"
        icon={<ListIcon />}
        disabled={selectedLeague === null}
        className={selectedLeague === null ? classes.disabledAction : undefined}
      />
      <BottomNavigationAction
        component={Link}
        to="/stats"
        value="stats"
        label="Stats"
        icon={<EqualizerIcon />}
        disabled={selectedLeague === null}
        className={selectedLeague === null ? classes.disabledAction : undefined}
      />
    </BottomNavigation>
  );
};
