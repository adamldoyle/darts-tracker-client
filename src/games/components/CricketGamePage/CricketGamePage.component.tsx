import { FC, FormEvent, useState } from 'react';
import { Button, Box, Drawer, Grid, Typography, IconButton, Tooltip, makeStyles } from '@material-ui/core';
import { ICricketGameData, IPlayerCricketStats } from 'store/games/types';
import { RadioButtonChecked, RadioButtonUnchecked, Close } from '@material-ui/icons';
import {
  DartboardClickDetails,
  DartboardWrapper,
  getScoringNumberFromBed,
  isDoubleScore,
  isTripleScore,
} from '../../../scoreboard/components';
import { useHistory } from 'react-router-dom';
import { playerUtils } from 'shared/utils';

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
    const hitCountWithDart = isDoubleScore(dartThrown) ? 2 : isTripleScore(dartThrown) ? 3 : 1;
    if (Object.keys(currentPlayerScoringStatus).includes(`${hitNumber}`) && scoringNumbers.includes(hitNumber)) {
      const hitTotal = (currentPlayerScoringStatus[hitNumber] ?? 0) + hitCountWithDart;
      const playersKeysToIterate = Object.keys(playerStats).filter((pk) => (playerStats[pk].scoringNumberStatus?.[hitNumber] ?? 0) < 3 && pk !== player)
      if (hitTotal > 3) {
        playersKeysToIterate.forEach((pk) => {
          if ((currentPlayerScoringStatus[hitNumber] ?? 0) < 3) {
            playerStats[parseInt(pk)].scoringTotal += (((hitCountWithDart + (currentPlayerScoringStatus[hitNumber] ?? 0)) - 3) * hitNumber);
          } else {
            playerStats[parseInt(pk)].scoringTotal += (hitCountWithDart * hitNumber);
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
  const [dart1, setDart1] = useState<string>('');
  const [dart2, setDart2] = useState<string>('');
  const [dart3, setDart3] = useState<string>('');
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
    setDart1('')
    setDart2('');
    setDart3('');
    setSaving(false);
  };

  const addScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveScore([dart1, dart2, dart3]);
  };

  const handleDartboardClick = (details: DartboardClickDetails) => {
    if (dart1 === '') {
      setDart1(details.bed);
    } else if (dart2 === '') {
      setDart2(details.bed);
    } else if (dart3 === '') {
      setDart3(details.bed);
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

  return (
    <>
      <Box style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={2}>
            <Button variant="outlined" color="default" onClick={() => setShowFunStats(true)}>
              Stats
            </Button>
          </Grid>
          <Grid item xs={8}><h2 style={{ textAlign: 'center' }}>[Cut-Throat] Cricket</h2></Grid>
          <Grid item xs={2}>
            <Button variant="outlined" color="default" onClick={() => setShowRounds(true)}>
              Rounds
            </Button>
          </Grid>
          <Grid item>
            <div style={{ flex: '1 0 auto', justifyItems: 'center', marginTop: 20 }}>
              <table className={classes.cricketTable} style={{ borderWidth: 1, borderStyle: 'solid' }}>
                <thead>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Player</td>
                  <td style={{ fontWeight: 'bold' }}>Score</td>
                  {gameData?.config.scoringNumbers?.sort().map((scoringNumber) => (
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
                  ))}
                </tr>
                </thead>
                <tbody>
                {gameData?.config.players.map((player) => (
                  <tr key={player}>
                    <td>{currentPlayer === player ? '> ' : ''}{playerUtils.displayName(player)}:&#9; {playerEmoji(player)}</td>
                    <td><b>{gameData?.playerStats?.[player]?.scoringTotal ?? 0}</b></td>
                    {gameData?.config.scoringNumbers?.map((scoringNumber) => (
                      <td key={`${player}_${scoringNumber}`} style={{ fontWeight: 'bold' }}>
                        {renderPlayerScore(player, scoringNumber ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </Grid>
          <Grid item >
            {!gameOver ? (<div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
              <h2>Current player: {playerUtils.displayName(currentPlayer)}</h2>
              <div style={{ marginTop: 10,marginBottom: 10 }}>
                <form onSubmit={addScore}>
                  <input value={dart1} onChange={(evt) => setDart1(evt.target.value)}/>
                  <input value={dart2} onChange={(evt) => setDart2(evt.target.value)}/>
                  <input value={dart3} onChange={(evt) => setDart3(evt.target.value)}/>
                  <input type="submit" value="Save score" />
                </form>
              </div>
              <div>
                <DartboardWrapper size={400} onClick={handleDartboardClick} />
              </div>
            </div>) : (<div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
              <h2>Game over!</h2>
              <p>Winner: {(Object.keys(gameData.playerStats).find((player) => isWinner(player)))}</p>
            </div>)}
          </Grid>
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
                  <IconButton data-testid={`floating-drawer-close-button`} onClick={() => setShowFunStats(false)} size="small">
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
          <Drawer anchor="right"
                  open={showRounds}
                  variant="persistent"
                  onClose={() => setShowRounds(false)}
                  classes={{
                    paper: `${classes.drawer} ${classes.drawerRight}`,
                  }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" className={classes.title}>
              <Box>
                <Typography component="h3" variant="h5">
                  Rounds
                </Typography>
              </Box>
              <Box>
                <Tooltip title="Close drawer">
                  <IconButton data-testid={`floating-drawer-close-button`} onClick={() => setShowRounds(false)} size="small">
                    <Close />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box height="100%" padding={4} style={{ overflowY: 'scroll'}}>
              {!rounds.length && (<Typography variant="subtitle1">No rounds played</Typography>)}
              {rounds.map((round, index) => (
                <div>
                  <div><b>Round #{index + 1}</b></div>
                  <div>
                    {Object.entries(round).map(([player, scores]) => (
                      <p>
                        <b>{playerUtils.displayName(player)}</b>&#9;--&#9;{scores.map((scoreBed, index) =>
                          <span>
                      {isDoubleScore(scoreBed) ? 'D' : isTripleScore(scoreBed) ? 'T' : ''}{getScoringNumberFromBed(scoreBed)}
                            {index === scores?.length - 1 ? '' : ', '}
                    </span>
                      )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </Box>
          </Drawer>
        </Grid>
      </Box>
    </>
  );
};
