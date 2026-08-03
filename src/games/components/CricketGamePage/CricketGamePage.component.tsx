import { FC, FormEvent, useEffect, useState } from 'react';
import { Badge, Button, Slide, Box, Drawer, Grid, Typography, IconButton, Tooltip, makeStyles } from '@material-ui/core';
import { DartRound, DartThrow, GameEvent, ICricketGameData, IPlayerCricketStats, RoundInfo } from 'store/games/types';
import { RadioButtonChecked, RadioButtonUnchecked, Close } from '@material-ui/icons';
import {
  DartboardClickDetails,
  DartboardWrapper,
  getScoringNumberFromBed,
  isDoubleScore, isMissScore,
  isTripleScore, MISSED_DART, TickerGameEventsProps,
} from '../../../scoreboard/components';
import { useHistory } from 'react-router-dom';
import { playerUtils } from 'shared/utils';
import { DartScore } from '../../../scoreboard/components/DartScore';

const useStyles = makeStyles((theme) => ({
  formField: {
    maxWidth: 400,
  },
  cricketTable: {
    '& tr td:nth-child(even)': {
      backgroundColor: 'lightgray',
    },
    '& tr td': {
      padding: '8px',
    }
  },
  drawer: {
    marginTop: 80,
    border: `1px solid grey`,
    height: 'calc(100% - 95px)',
    width: 500,
  },
  largeDrawer: {
    marginTop: 80,
    border: `1px solid grey`,
    height: 'calc(100% - 95px)',
    width: 750,
  },
  drawerLeft: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  drawerRight: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  title: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
  playerRound: {
    marginLeft: theme.spacing(1),
  },
  editingModeDartBoard: {
    background: `radial-gradient(circle at center, ${theme.palette.secondary.main} 0, ${theme.palette.grey[200]} 100%)`,
  },
  ticker: {
    position: 'sticky',
    bottom: 0,
    width: "100%",
    color: theme.palette.primary.contrastText,
    background: `linear-gradient(0deg, #171717, 80%, ${theme.palette.secondary.main})`,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    border: `2px inset ${theme.palette.grey[500]}`,
  },
  tickerScores: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: '32px',
    overflowX: 'scroll',
    scrollbarWidth: 'none',
    backgroundColor: '#171717',
    borderRadius: theme.shape.borderRadius,
    border: `2px inset ${theme.palette.grey[500]}`,
    whiteSpace: 'nowrap',
  },
  tickerRoundNumber: {
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
  },
  missButton: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(20),
    '&:hover': {
      cursor: 'pointer',
      background: `linear-gradient(0deg, #171717, 30%, ${theme.palette.background.paper})`,
    },
  }
}));

const calculateNumberOfHits = (scoringNumber: number, player: string, rounds: DartRound[], ) => {
  const playerScores = rounds.map((round) => {
    return round[player];
  }).flat();
  const matchingScores = playerScores?.filter((dart) => dart?.bed && getScoringNumberFromBed(dart.bed) === scoringNumber) ?? [];
  let numberOfHits = 0;
  matchingScores.forEach((dart) => {
    if (!dart) return;
     if (isDoubleScore(dart?.bed)) {
      numberOfHits = numberOfHits + 2;
    } else if (isTripleScore(dart?.bed)) {
      numberOfHits = numberOfHits + 3;
    } else if (isMissScore(dart?.bed)) {
       //no change
     } else {
       numberOfHits++;
     }
  });
  return numberOfHits;
}

const iterateScoresForPlayerRoundScore = (playerStats: Record<string, IPlayerCricketStats>, roundScore: [DartThrow, DartThrow ,DartThrow], player: string, scoringNumbers: number[] = [], addEvent: (event: GameEvent) => void) => {
  roundScore.forEach((dartThrown) => {
    const hitNumber = getScoringNumberFromBed(dartThrown?.bed);
    if (isNaN(hitNumber)) return;
    const currentPlayerScoringStatus = playerStats[player]?.scoringNumberStatus ?? {};
    const hitCountWithDart = isDoubleScore(dartThrown?.bed) ? 2 : isTripleScore(dartThrown?.bed) ? 3 : isMissScore(dartThrown?.bed) ? 0 : 1;
    if (Object.keys(currentPlayerScoringStatus).includes(`${hitNumber}`) && scoringNumbers.includes(hitNumber) && hitCountWithDart > 0) {
      const hitTotal = (currentPlayerScoringStatus[hitNumber] ?? 0) + hitCountWithDart;
      const playersKeysToIterate = Object.keys(playerStats).filter((pk) => (playerStats[pk].scoringNumberStatus?.[hitNumber] ?? 0) < 3 && pk !== player)
      if (hitTotal > 3) {
        playersKeysToIterate.forEach((pk) => {
          if ((currentPlayerScoringStatus[hitNumber] ?? 0) < 3) {
            playerStats[pk].scoringTotal += (((hitCountWithDart + (currentPlayerScoringStatus[hitNumber] ?? 0)) - 3) * hitNumber);
          } else {
            playerStats[pk].scoringTotal += (hitCountWithDart * hitNumber);
          }
        })
      }
    }
    // iterate on number of hits
    if (currentPlayerScoringStatus[hitNumber] !== undefined) {
      currentPlayerScoringStatus[hitNumber] += hitCountWithDart;
    } else {
      currentPlayerScoringStatus[hitNumber] = hitCountWithDart;
    }
  })
}

const buildCricketGameData = (config: {
  datePlayed: number;
  players: string[];
  scoringNumbers?: number[];
}, rounds: DartRound[]): ICricketGameData => {
  const gameEvents: GameEvent[] = [];
  const playerStats = rounds.reduce<Record<string, IPlayerCricketStats>>(
    (acc, round) => {
      Object.entries(round).forEach(([player, roundScore]) => {
        const playerStats = acc[player];
        iterateScoresForPlayerRoundScore(acc, roundScore, player, config.scoringNumbers, (event) => gameEvents.push(event));
        playerStats.roundsPlayed++;
      });
      return acc;
    },
    config.players.reduce<Record<string, IPlayerCricketStats>>((acc, player) => {
      acc[player] = {
        roundsPlayed: 0,
        scoringNumberStatus: {},
        scoringTotal: 0,
      };
      return acc;
    }, {})
  );
  const _gameData: ICricketGameData = { config, rounds, playerStats, events: gameEvents };
  if (
    !Object.values(_gameData.playerStats).find(
      (stats) => stats.roundsPlayed < (rounds.length ?? 0),
    )
  ) {
    _gameData.rounds.push({});
  }
  return _gameData;
}

const getTotalHits = (scoringNumberStatus: Record<number, number>, scoringNums: number[]) => {
  const sumScores = (scores: number[]) => scores.reduce<number>((acc, score) => acc + score, 0);
  return sumScores(Object.entries(scoringNumberStatus).filter(([scoreNum,_]) => scoringNums.includes(parseInt(scoreNum))).map(([_, score]) => score <= 3 ? score : 3));
}

export interface CricketGamePageProps {}

const CountUpScore = ({score}: {score: number}) => {
  const [localScore, setLocalScore] = useState(0);

  useEffect(() => {
    const count = score - localScore;
    if (count === 0) return;
    if (localScore > score) {
      setLocalScore(score);
      return;
    }
    const iterations = Math.round(800 / 20);
    let ticks = 0;
    const iterate = setInterval(() => {
      ticks++
      setLocalScore(score + Math.floor(count*Math.log10(ticks/iterations)));
      if (ticks === iterations) {
        clearInterval(iterate);
      }
    }, 20)
  }, [score]);

  return <b style={localScore < score ? { color: 'red'} : {}}>{localScore}</b>
}

export const CricketGamePage: FC<CricketGamePageProps> = () => {
  const classes = useStyles();
  const history = useHistory();

  const pageState: Partial<ICricketGameData> = (history?.location?.state ?? {}) as ICricketGameData;

  const [gameData, setGameData] = useState<ICricketGameData>({
    config: {
      datePlayed: pageState.config?.datePlayed ?? new Date().getTime(),
      scoringNumbers:  pageState.config?.scoringNumbers ?? [20, 19, 18, 17, 16, 15, 25],
      players: pageState.config?.players ?? ['Player 1', 'Player 2'],
    },
    rounds: [{}],
    playerStats: {},
    events: [{ eventName: 'New Game', eventDescription: 'Cricket game created.', roundInfo: { round: 0, player: '_game_', dart: null }}]
  });

  const [editCurrentDart, setEditCurrentDart] = useState<1 | 2 | 3 | null>(null);
  const [dart1, setDart1] = useState<DartThrow>(null);
  const [dart2, setDart2] = useState<DartThrow>(null);
  const [dart3, setDart3] = useState<DartThrow>(null);
  const [editScore, setEditScore] = useState<RoundInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFunStats, setShowFunStats] = useState(false);

  const playerStats = gameData?.playerStats ?? {};
  const rounds = gameData?.rounds ?? [{}];
  const currentRound = rounds.length - 1;

  const remainingRoundPlayers = gameData?.config.players.filter(
    (player) => (playerStats[player]?.roundsPlayed ?? 0) !== rounds.length);
  const currentPlayer = remainingRoundPlayers[0];

  const renderPlayerScore = (player: string, scoringNumber: number) => {
    const numberOfHits = calculateNumberOfHits(scoringNumber, player, rounds);
    const notClearedPlayers = gameData?.config.players.filter(
      (player) => (playerStats[player]?.scoringNumberStatus[scoringNumber] ?? 0) < 3);
    const color = notClearedPlayers.length > 0 ? numberOfHits >= 3 ? 'secondary' : 'primary' : 'disabled';
    return (
      <>
        {numberOfHits >= 1 ? <RadioButtonChecked color={color} /> : <RadioButtonUnchecked color={'disabled'} />}
        {numberOfHits >= 2 ? <RadioButtonChecked color={color} /> : <RadioButtonUnchecked color={'disabled'} />}
        {numberOfHits >= 3 ? <RadioButtonChecked color={color} /> : <RadioButtonUnchecked color={'disabled'} />}
      </>
    );
  }

  const saveScore = async (_newScore: DartThrow[]) => {
    if (saving) {
      return;
    }
    setSaving(true);
    if (!gameData?.config) return;
    const newRounds = [...rounds];
    newRounds[currentRound][currentPlayer] = [_newScore?.[0] ?? MISSED_DART, _newScore?.[1] ?? MISSED_DART, _newScore?.[2] ?? MISSED_DART];
    const newGameData = buildCricketGameData(gameData?.config, newRounds);
    setGameData(newGameData);
    setDart1(null)
    setDart2(null);
    setDart3(null);
    setSaving(false);
  };

  const saveEditScore = async (_newScore: DartThrow) => {
    if (saving) {
      return;
    }
    setSaving(true);
    if (!gameData?.config || !editScore || editScore.dart === null) return;
    setGameData((_prev) => {
      const newRounds = [..._prev.rounds];
      newRounds[editScore.round][editScore.player][editScore.dart ?? 0] = _newScore;
      return {
        ..._prev,
        rounds: newRounds,
      }
    });
    setEditScore(null);
    setSaving(false);
  };

  const addScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveScore([dart1, dart2, dart3]);
  };

  const handleDartboardClick = (details: DartboardClickDetails) => {
    if (!!editScore) {
      saveEditScore(details);
    } else if (!dart1 || editCurrentDart === 1) {
      setDart1(details);
    } else if (!dart2 || editCurrentDart === 2) {
      setDart2(details);
    } else if (!dart3 || editCurrentDart === 3) {
      setDart3(details);
    }
    setEditCurrentDart(null);
  };

  const playerHasMostHits = (player: string) => {
    const userStats = playerStats[player];
    // Calculate total hits
    const totalHits: number = getTotalHits(userStats.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []);
    const allPlayerHitCount = Object.entries(playerStats).filter(([_player,_]) => _player !== player).map(([_, ps]) => getTotalHits(ps.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []))
    return allPlayerHitCount.every((s) => s < totalHits)
  }

  const playerHasWinningScore = (player: string) => {
    const userStats = playerStats[player];
    const otherPlayerStats = Object.entries(playerStats).filter(([_player,_]) => _player !== player).map(([_, ps]) => ps.scoringTotal)
    // Player has least points scored on them
    return otherPlayerStats.every((s) => s > userStats.scoringTotal);
  }

  const playerHasLeastHits = (player: string) => {
    const userStats = playerStats[player];
    // Calculate total hits
    const totalHits: number = getTotalHits(userStats.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []);
    const allPlayerHitCount = Object.entries(playerStats).filter(([_player,_]) => _player !== player).map(([_, ps]) => getTotalHits(ps.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []))
    return allPlayerHitCount.every((s) => s > totalHits);
  }

  const playerHasLosingScore = (player: string) => {
    const userStats = playerStats[player];
    const otherPlayerStats = Object.entries(playerStats).filter(([_player,_]) => _player !== player).map(([_, ps]) => ps.scoringTotal)
    // Player has more points scored on them
    return otherPlayerStats.every((s) => s < userStats.scoringTotal);
  }

  const isWinner = (player: string) => {
    const userStats = playerStats[player];
    if (!userStats) return false;
    const unfinishedEntries = Object.entries(userStats.scoringNumberStatus).filter(([scoreNum,_]) => (gameData?.config?.scoringNumbers ?? []).includes(parseInt(scoreNum))).filter(([_, hits]) => hits < 3);
    const otherPlayerStats = Object.entries(playerStats).filter(([_player,_]) => _player !== player).map(([_, ps]) => ps.scoringTotal)
    const allScoringNumbersScored = !(gameData?.config?.scoringNumbers ?? []).some((scn) => Object.keys(userStats.scoringNumberStatus).includes(`${scn}`));
    return allScoringNumbersScored && unfinishedEntries?.length === 0 && otherPlayerStats.every((s) => s > userStats.scoringTotal);
  };
  const isLeader = (player: string) => {
    const userStats = playerStats[player];
    if (!userStats) return false;
    return !isWinner(player) && (playerHasWinningScore(player) || playerHasMostHits(player));
  };
  const isLoser = (player: string) => {
    return (
      rounds.length > 1 &&
      !isLeader(player) &&
      (playerHasLosingScore(player) || playerHasLeastHits(player))
    );
  };

  const playerEmoji = (player: string) => {
    if (isWinner(player)) {
      return <>&#128081;</>;
    } else if (isLeader(player)) {
      return <>&#11088;</>;
    } else if (isLoser(player)) {
      return <>&#128169;</>;
    }
    return <>{'  '}</>;
  };

  const gameOver = Object.keys(gameData.playerStats).some((player) => isWinner(player));
  const getIsSelected = (player: string, round: number, dart: number) => {
    return editScore?.player === player && editScore?.round === round && editScore?.dart === dart;
  }

  // FIXME: add 'opt out' behavior to skip players when they have soft-won

  return (
    <>
      <Box minHeight="100vh" width="100%" display="flex" flexDirection="column">
        <Grid container justify="space-around">
          <Grid item>
            <Box height="100%" alignContent="center">
              <table className={classes.cricketTable} style={{ borderWidth: 1, borderStyle: 'solid' }}>
                <thead>
                <tr>
                  <td></td>
                  {gameData?.config.players.map((player) => (
                    <td>{currentPlayer === player ? '> ' : ''}{playerUtils.displayName(player)}:&#9; {playerEmoji(player)}</td>
                  ))}
                </tr>
                </thead>

                <tbody>
                <tr>
                  <td>Score</td>
                  {gameData?.config.players.map((player) => (
                    <td key={player}>
                      <b><CountUpScore score={gameData?.playerStats?.[player]?.scoringTotal ?? 0} /></b>
                    </td>
                  ))}
                </tr>
                {gameData?.config.scoringNumbers?.sort().map((scoringNumber) => (
                  <tr>
                    <td key={scoringNumber} style={{ fontWeight: 'bold' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {scoringNumber === 25 ? 'Bull' : scoringNumber}
                      </div>
                    </td>
                    {gameData?.config.players.map((player) => (
                      <td key={`${player}_${scoringNumber}`} style={{ fontWeight: 'bold' }}>
                        {renderPlayerScore(player, scoringNumber ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </Box>
          </Grid>
          <Grid item>
            {!gameOver ? (
              <Badge anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }} badgeContent={
                <Box onClick={() => handleDartboardClick(MISSED_DART)} className={classes.missButton}>
                  <Typography variant="h6">MISS</Typography>
                </Box>
              }>
                <Box padding={2} className={!!editScore ? classes.editingModeDartBoard : ''} style={{ borderRadius: (window.innerHeight * (80/100))}}>
                  <DartboardWrapper size={(window.innerHeight * (80/100))} onClick={handleDartboardClick} />
                </Box>
              </Badge>
            ) : (
              <Box>
                <h2>Game over!</h2>
                <p>Winner: {(Object.keys(gameData.playerStats).find((player) => isWinner(player)))}</p>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.ticker}>
        <Grid container>
          <Grid item xs={1}>
            <Button variant="text" color="secondary" onClick={() => setShowFunStats(true)}>
              Stats
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" width="100%" className={classes.tickerScores}>
              <Box display="flex" flexDirection="row-reverse">
                <Box padding={0.5}><Typography>Cut-Throat Cricket</Typography></Box>
                {rounds.map((round, index) => (
                  <>
                    <Box className={classes.tickerRoundNumber}>{index+1}</Box>
                    {Object.entries(round).map(([player, scores]) => (
                      <Slide key={`${player}_round_${index}_scores`} direction="right" in={true} timeout={800}>
                        <Box key={`${player}_round_${index}_scores`} display="flex">
                          <Tooltip title={`${playerUtils.displayName(player)} round # ${index + 1}`}>
                            <Box display="flex" className={classes.playerRound} justifyContent="row-reverse">
                              {scores.map((dart, idx) =>
                                <DartScore
                                  key={`${player}_round_${index}_score_${idx}`}
                                  position={idx=== 0 ? 'left' : idx === (scores.length - 1) ? 'right': 'default'}
                                  dart={dart}
                                  onClick={() => {
                                    setEditCurrentDart(null);
                                    setEditScore(getIsSelected(player, index, idx) ? null : {player, round: index, dart: idx});
                                  }}
                                  selected={getIsSelected(player, index, idx)}
                                />
                              )}
                            </Box>
                          </Tooltip>
                        </Box>
                      </Slide>
                    ))}
                  </>
                ))}
              </Box>
              <TickerGameEventsProps events={gameData.events} />
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Box display="flex" justifyContent="space-between" paddingX={2} alignItems="center">
              <Typography variant="h6">Current player: {playerUtils.displayName(currentPlayer)}</Typography>
              <form onSubmit={addScore}>
                <Box display="flex" flexDirection="row" justifyContent="flex-end">
                  <DartScore disabled={!!editScore} onClick={() => {
                    setEditScore(null);
                    setEditCurrentDart(editCurrentDart === 3 ? null : 3);
                  }} position="left" dart={dart3} selected={editCurrentDart === 3} />
                  <DartScore disabled={!!editScore} onClick={() => {
                    setEditScore(null);
                    setEditCurrentDart(editCurrentDart === 2 ? null : 2)
                  }} dart={dart2} selected={editCurrentDart === 2} />
                  <DartScore disabled={!!editScore} onClick={() => {
                    setEditScore(null);
                    setEditCurrentDart(editCurrentDart === 1 ? null : 1)
                  }} position="right" dart={dart1} selected={editCurrentDart === 1} />
                  <Button disabled={!!editScore} type="submit" color="secondary">Save score</Button>
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Drawer anchor="left"
              open={showFunStats}
              variant="persistent"
              onClose={() => setShowFunStats(false)}
              classes={{
                paper: `${classes.drawer} ${classes.drawerLeft}`,
              }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" className={classes.title}>
          <Box>
            <Typography component="h3" variant="h5">
              Player Stats
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Close drawer">
              <IconButton onClick={() => setShowFunStats(false)} size="small">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box height="100%" padding={4} style={{ overflowY: 'scroll'}}>
          {!Object.entries(gameData.playerStats).length && (<Typography variant="subtitle1">No stats</Typography>)}
          {Object.entries(gameData.playerStats).map(([player, stats]) => {
            return (
              <div>
                <div><b>{playerUtils.displayName(player)}</b></div>
                <div>
                  <p>Score: {stats.scoringTotal}</p>
                  <p>Rounds: {stats.roundsPlayed}</p>
                  <p>Hits: {Object.entries(stats.scoringNumberStatus).map(([scNum, sc]) => !sc ? '' : `${scNum}: ${sc}, `)}</p>
                </div>
              </div>
            )
          })}
        </Box>
      </Drawer>
    </>
  );
};
