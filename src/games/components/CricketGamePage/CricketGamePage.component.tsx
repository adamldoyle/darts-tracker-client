import { FC, FormEvent, useState } from 'react';
import { Button, Slide, Box, Drawer, Grid, Typography, IconButton, Tooltip, makeStyles } from '@material-ui/core';
import { ICricketGameData, IPlayerCricketStats } from 'store/games/types';
import { RadioButtonChecked, RadioButtonUnchecked, Close, Edit } from '@material-ui/icons';
import {
  DartboardClickDetails,
  DartboardWrapper,
  getScoringNumberFromBed,
  isDoubleScore, isMissScore,
  isTripleScore,
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
  }
}));

const calculateNumberOfHits = (scoringNumber: number, player: string, rounds: Record<string, [string, string, string]>[], ) => {
  const playerScores = rounds.map((round) => {
    return round[player];
  }).flat();
  const matchingScores = playerScores?.filter((score) => getScoringNumberFromBed(score) === scoringNumber) ?? [];
  let numberOfHits = 0;
  matchingScores.forEach((score) => {
    if (!score) return;
     if (isDoubleScore(score)) {
      numberOfHits = numberOfHits + 2;
    } else if (isTripleScore(score)) {
      numberOfHits = numberOfHits + 3;
    } else if (isMissScore(score)) {
       //no change
     } else {
       numberOfHits++;
     }
  });
  return numberOfHits;
}

const iterateScoresForPlayerRoundScore = (playerStats: Record<string, IPlayerCricketStats>, roundScore: [string, string, string], player: string, scoringNumbers: number[] = []) => {
  roundScore.forEach((dartThrown) => {
    const hitNumber = getScoringNumberFromBed(dartThrown);
    if (isNaN(hitNumber)) return;
    const currentPlayerScoringStatus = playerStats[player]?.scoringNumberStatus ?? {};
    const hitCountWithDart = isDoubleScore(dartThrown) ? 2 : isTripleScore(dartThrown) ? 3 : isMissScore(dartThrown) ? 0 : 1;
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
}, rounds: Record<number, [string, string, string]>[]): ICricketGameData => {
  const playerStats = rounds.reduce<Record<string, IPlayerCricketStats>>(
    (acc, round) => {
      Object.entries(round).forEach(([player, roundScore]) => {
        const playerStats = acc[player];
        iterateScoresForPlayerRoundScore(acc, roundScore, player, config.scoringNumbers);
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
  const _gameData: ICricketGameData = { config, rounds, playerStats };
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
    playerStats: {}
  });
  const [dart1, setDart1] = useState<DartboardClickDetails | null>(null);
  const [dart2, setDart2] = useState<DartboardClickDetails | null>(null);
  const [dart3, setDart3] = useState<DartboardClickDetails | null>(null);
  const [editScore, setEditScore] = useState<{player: string, round: number} | null>(null);
  const [tempDart1, setTempDart1] = useState<DartboardClickDetails | null>(null);
  const [tempDart2, setTempDart2] = useState<DartboardClickDetails | null>(null);
  const [tempDart3, setTempDart3] = useState<DartboardClickDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFunStats, setShowFunStats] = useState(false);
  const [showRounds, setShowRounds] = useState(false);

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

  const saveScore = async (_newScore: string[]) => {
    if (saving) {
      return;
    }
    setSaving(true);
    if (!gameData?.config) return;
    const newRounds = [...rounds];
    newRounds[currentRound][currentPlayer] = [_newScore?.[0] ?? 0, _newScore?.[1] ?? 0, _newScore?.[2] ?? 0];
    const newGameData = buildCricketGameData(gameData?.config, newRounds);
    setGameData(newGameData);
    setDart1(null)
    setDart2(null);
    setDart3(null);
    setSaving(false);
  };

  const resetEdit = () => {
    setTempDart1(null)
    setTempDart2(null);
    setTempDart3(null);
    setEditScore(null);
  }

  const saveEditScore = async (_newScore: string[]) => {
    if (saving) {
      return;
    }
    setSaving(true);
    if (!gameData?.config || !editScore) return;
    setGameData((_prev) => {
      const newRounds = [..._prev.rounds];
      newRounds[editScore.round][editScore.player] = [_newScore?.[0] ?? 0, _newScore?.[1] ?? 0, _newScore?.[2] ?? 0];
      return {
        ..._prev,
        rounds: newRounds,
      }
    });
    resetEdit();
    setSaving(false);
  };

  const addScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveScore([dart1?.bed ?? '', dart2?.bed ?? '', dart3?.bed ?? '']);
  };

  const onEditScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveEditScore([tempDart1?.bed ?? '', tempDart2?.bed ?? '', tempDart3?.bed ?? '']);
  };

  const handleDartboardClick = (details: DartboardClickDetails) => {
    if (!dart1) {
      setDart1(details);
    } else if (!dart2) {
      setDart2(details);
    } else if (!dart3) {
      setDart3(details);
    }
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
    return null;
  };

  const gameOver = Object.keys(gameData.playerStats).some((player) => isWinner(player));

  // FIXME: add 'opt out' behavior to skip players when they have soft-won

  return (
    <>
      <Box height="97vh" width="100%" display="flex" flexDirection="column">
        <Box height="90%" width="100%">
          <Grid container spacing={1} justify="space-around">
            <Grid item>
              <div style={{ flex: '1 0 auto', justifyItems: 'center', marginTop: 20 }}>
                <table className={classes.cricketTable} style={{ borderWidth: 1, borderStyle: 'solid' }}>
                  <thead>
                  <tr>
                    <td></td>
                    {gameData?.config.players.map((player) => (
                      <td>{currentPlayer === player ? '> ' : ''}{playerUtils.displayName(player)}:&#9; {playerEmoji(player)}</td>
                    ))}
                  </tr>
                  </thead>
                  <tr>
                    <td>Score</td>
                    {gameData?.config.players.map((player) => (
                      <td key={player}>
                        <td><b>{gameData?.playerStats?.[player]?.scoringTotal ?? 0}</b></td>
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
                  <tbody>
                  </tbody>
                </table>
              </div>
            </Grid>
            <Grid item>
              {!gameOver ? (<div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
                <div>
                  <DartboardWrapper mode="window" size={80} onClick={handleDartboardClick} />
                </div>
              </div>) : (<div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
                <h2>Game over!</h2>
                <p>Winner: {(Object.keys(gameData.playerStats).find((player) => isWinner(player)))}</p>
              </div>)}
          </Grid>
          </Grid>
        </Box>
        <Box height="10%" width="100%">
          <Grid container>
            <Grid item xs={1}>
              <Button variant="text" color="default" onClick={() => setShowFunStats(true)}>
                Stats
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" width="100%" style={{ paddingLeft: '32px', overflowX: 'scroll', scrollbarWidth: 'none'}}>
                <Box display="flex" flexDirection="row-reverse">
                  {!rounds.length && (<Box><Typography variant="subtitle1">No rounds played</Typography></Box>)}
                  {rounds.map((round, index) => (
                    Object.entries(round).map(([player, scores]) => (
                      <Slide key={`${player}_round_${index}_scores`} direction="right" in={true} timeout={800}>
                          <Box key={`${player}_round_${index}_scores`} display="flex">
                          <Tooltip title={`${playerUtils.displayName(player)} round # ${index + 1}`}>
                            <Box display="flex" className={classes.playerRound} justifyContent="row-reverse">
                              {scores.map((scoreBed, idx) =>
                                <DartScore key={`${player}_round_${index}_score_${idx}`} dart={{ ring: 'fixme', score: getScoringNumberFromBed(scoreBed), bed: scoreBed}} />
                              )}
                            </Box>
                          </Tooltip>
                        </Box>
                      </Slide>
                    ))
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={5}>
              <Box display="flex" justifyContent="space-between" paddingX={2}>
                <Typography variant="h6">Current player: {playerUtils.displayName(currentPlayer)}</Typography>
                <form onSubmit={addScore}>
                  <Box display="flex" flexDirection="row" justifyContent="flex-end">
                    <DartScore dart={dart3} />
                    <DartScore dart={dart2} />
                    <DartScore dart={dart1} />
                    <input type="submit" value="Save score" />
                  </Box>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Box>
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
