import { useState, FC } from 'react';
import { API } from 'aws-amplify';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  IconButton,
  LinearProgress,
  Grid,
  Typography,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { ILeague, ILeagueWithMembers } from 'store/leagues/types';
import { hooks, actions, selectors } from 'store/leagues/slice';
import { EditLeagueModal } from '../EditLeagueModal';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  loading: {
    marginTop: theme.spacing(10),
  },
  card: {
    height: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

export interface LeaguesListProps {}

export const LeaguesList: FC<LeaguesListProps> = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [selectingLeague, setSelectingLeague] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<ILeagueWithMembers | null>(null);

  const { data: leagues, loading, makeStale } = hooks.useMonitoredData();
  const selectedLeague = useSelector(selectors.selectSelectedLeague);

  const handleAddSubmit = () => {
    makeStale();
    setAddModalOpen(false);
    if (selectedLeague) {
      selectLeague(selectedLeague.leagueKey);
    }
  };

  const loadLeague = async (leagueKey: string): Promise<ILeagueWithMembers> => {
    return await API.get('leagues', `/leagues/${leagueKey}`, {});
  };

  const editLeague = async (evt: React.MouseEvent, simpleLeague: ILeague) => {
    evt.stopPropagation();
    const league = await loadLeague(simpleLeague.leagueKey);
    setEditingLeague(league);
  };

  const handleEditSubmit = () => {
    makeStale();
    setEditingLeague(null);
    if (selectedLeague) {
      selectLeague(selectedLeague.leagueKey);
    }
  };

  const selectLeague = async (leagueKey: string) => {
    setSelectingLeague(leagueKey);
    try {
      const league = await loadLeague(leagueKey);
      dispatch(actions.selectLeague(league));
    } catch (err) {
    } finally {
      setSelectingLeague(null);
    }
  };

  return (
    <Grid container spacing={2} className={classes.root}>
      {loading && (
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center">
            <CircularProgress size={100} className={classes.loading} />
          </Box>
        </Grid>
      )}
      {!loading && (
        <>
          <EditLeagueModal open={addModalOpen} onSubmit={handleAddSubmit} onCancel={() => setAddModalOpen(false)} />
          <EditLeagueModal
            league={editingLeague ?? undefined}
            open={!!editingLeague}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingLeague(null)}
          />
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardActionArea
                aria-label="Create league"
                disabled={Boolean(selectingLeague)}
                onClick={() => setAddModalOpen(true)}
              >
                <CardContent className={classes.card}>
                  <Grid container direction="row" alignItems="center" wrap="nowrap">
                    <Grid item>
                      <AddIcon />
                    </Grid>
                    <Grid item>
                      <Typography variant="h5" component="h2">
                        Create league
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          {leagues.map((league) => (
            <Grid key={league.leagueKey} item xs={12} sm={6} md={4} lg={3}>
              <Card>
                <CardActionArea
                  aria-label={`Select ${league.name}`}
                  disabled={Boolean(selectingLeague)}
                  onClick={() => selectLeague(league.leagueKey)}
                >
                  <CardContent className={classes.card}>
                    <Grid container direction="row" alignItems="center" wrap="nowrap">
                      <Grid item>
                        {selectedLeague?.leagueKey === league.leagueKey ? (
                          <Tooltip title="Current league">
                            <CheckCircleIcon />
                          </Tooltip>
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )}
                      </Grid>
                      <Grid item>
                        <Typography variant="h5" component="h2">
                          {league.name}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Edit league">
                          <IconButton onClick={(evt) => editLeague(evt, league)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <LinearProgress
                      style={{
                        visibility: selectingLeague === league.leagueKey ? undefined : 'hidden',
                      }}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </>
      )}
    </Grid>
  );
};
