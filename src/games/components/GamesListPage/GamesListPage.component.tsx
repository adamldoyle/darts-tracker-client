import { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import { hooks } from 'store/games/slice';
import { useSelector } from 'react-redux';
import { selectors } from 'store/leagues/slice';
import { IGame } from 'store/games/types';
import { comparePlayerStats } from 'store/games/helpers';
import { playerUtils } from 'shared/utils';

const useStyles = makeStyles((theme) => ({
  listItem: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
}));

export interface GamesListPageProps {}

const GameListItem = ({ game }: { game: IGame }) => {
  const classes = useStyles();

  const datePlayed = new Date(game.data.config.datePlayed);
  const sortedPlayers = Object.values(game.data.playerStats).sort(comparePlayerStats);

  return (
    <ListItem className={classes.listItem}>
      <ListItemText
        primary={`${datePlayed.toLocaleDateString()} ${datePlayed.toLocaleTimeString()}`}
        secondary={sortedPlayers
          .map((sortedPlayer) => `${sortedPlayer.ranking}. ${playerUtils.displayName(sortedPlayer.email)}`)
          .join(', ')}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="view" component={Link} to={`/game/${game.gameId}`}>
          <SearchIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export const GamesListPage: FC<GamesListPageProps> = () => {
  const selectedLeague = useSelector(selectors.selectSelectedLeague);
  const { data: games, loading: gamesLoading } = hooks.useMonitoredData();

  if (gamesLoading || !selectedLeague) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <>
      <List>
        {games.map((game) => (
          <GameListItem key={game.gameId} game={game} />
        ))}
      </List>
    </>
  );
};
