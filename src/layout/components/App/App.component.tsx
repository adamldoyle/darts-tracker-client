import { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, makeStyles, Hidden } from '@material-ui/core';
import { selectors } from 'store/leagues/slice';
import { LeaguesList } from 'leagues/components';
import { Scoreboard } from 'scoreboard/components';
import { AppToolbar } from '../AppToolbar';
import { QuickBar } from '../QuickBar';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  quickBarSpacer: {
    height: theme.spacing(10),
  },
}));

const AppContents: FC = () => {
  const selectedLeague = useSelector(selectors.selectSelectedLeague);

  if (!selectedLeague) {
    return <LeaguesList />;
  }

  return (
    <Switch>
      <Route path="/leagues" component={LeaguesList} />
      <Route path="/game" component={Scoreboard} />
    </Switch>
  );
};

export const App: FC = () => {
  const classes = useStyles();

  return (
    <>
      <AppToolbar />
      <Box className={classes.container}>
        <AppContents />
      </Box>
      <Hidden mdUp>
        <Box className={classes.quickBarSpacer} />
        <QuickBar />
      </Hidden>
    </>
  );
};
