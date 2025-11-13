import { FC, FormEvent, useState } from 'react';
import { Button, Grid, makeStyles } from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { handleRootErrors, RootError, InputField, SelectField } from 'form/components';
import { useDelayedFormValidation } from 'form/hooks';
import { ICricketGameData, IPlayerCricketStats } from 'store/games/types';
import { RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';
import {
  DartboardClickDetails,
  DartboardWrapper,
  getScoringNumberFromBed,
  isDoubleScore,
  isTripleScore,
} from '../../../scoreboard/components';

const Schema = Yup.object({
  scoringNumbers: Yup.array().of(Yup.number().default(0)).required('Set playable numbers').default([20, 19, 18, 17, 16, 15, 25]),
  playerCount: Yup.number(),
  randomize: Yup.boolean().default(false),
}).required();
type SchemaType = Yup.InferType<typeof Schema>;
const emptyFormDefaults = Schema.getDefault();

const useStyles = makeStyles(() => ({
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
}));

const calculateNumberOfHits = (scoringNumber: number, playerIndex: number, rounds: Record<number, [string, string, string]>[], ) => {
  const playerScores = rounds.map((round) => {
    return round[playerIndex];
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

const iterateScoresForPlayerRoundScore = (playerStats: Record<number, IPlayerCricketStats>, roundScore: [string, string, string], playerIndex: number, scoringNumbers: number[] = []) => {
  roundScore.forEach((dartThrown) => {
    const hitNumber = getScoringNumberFromBed(dartThrown);
    if (isNaN(hitNumber)) return;
    const currentPlayerScoringStatus = playerStats[playerIndex]?.scoringNumberStatus ?? {};
    const hitCountWithDart = isDoubleScore(dartThrown) ? 2 : isTripleScore(dartThrown) ? 3 : 1;
    if (Object.keys(currentPlayerScoringStatus).includes(`${hitNumber}`) && scoringNumbers.includes(hitNumber)) {
      const hitTotal = (currentPlayerScoringStatus[hitNumber] ?? 0) + hitCountWithDart;
      const playersKeysToIterate = Object.keys(playerStats).filter((pk) => (playerStats[parseInt(pk)].scoringNumberStatus?.[hitNumber] ?? 0) < 3 && parseInt(pk) !== playerIndex)
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
  playerCount: number;
  scoringNumbers?: number[];
}, rounds: Record<number, [string, string, string]>[]): ICricketGameData => {
  const playerStats = rounds.reduce<Record<number, IPlayerCricketStats>>(
    (acc, round) => {
      Object.entries(round).forEach(([playerIndex, roundScore]) => {
        const playerStats = acc[parseInt(playerIndex)];
        iterateScoresForPlayerRoundScore(acc, roundScore, parseInt(playerIndex) ?? 0, config.scoringNumbers);
        playerStats.roundsPlayed++;
      });
      return acc;
    },
    Array.from(Array(config.playerCount).keys()).reduce<Record<number, IPlayerCricketStats>>((acc, player) => {
      acc[player ?? 0] = {
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
  const { formikValidationProps, onSubmit: onFormSubmit } = useDelayedFormValidation<SchemaType>();

  const [gameData, setGameData] = useState<ICricketGameData>({
    config: {
      datePlayed: new Date().getTime(),
      scoringNumbers: [20, 19, 18, 17, 16, 15, 25],
      playerCount: 2,
    },
    rounds: [{}],
    playerStats: {}
  });
  const [dart1, setDart1] = useState<string>('');
  const [dart2, setDart2] = useState<string>('');
  const [dart3, setDart3] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const playerStats = gameData?.playerStats ?? {};
  const rounds = gameData?.rounds ?? [{}];
  const currentRound = rounds.length - 1;

  const remainingRoundPlayers = Array.from(Array(gameData?.config.playerCount ?? 1).keys()).filter(
    (player) => (playerStats[player]?.roundsPlayed ?? 0) !== rounds.length);
  const currentPlayer = remainingRoundPlayers[0];

  const renderPlayerScore = (player: number, scoringNumber: number) => {
    const numberOfHits = calculateNumberOfHits(scoringNumber, player, rounds);
    const notClearedPlayers = Array.from(Array(gameData?.config.playerCount ?? 1).keys()).filter(
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

  const playerHasMostHits = (player: number) => {
    const userStats = playerStats[player];
    // Calculate total hits
    const totalHits: number = getTotalHits(userStats.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []);
    const allPlayerHitCount = Object.entries(playerStats).filter(([pNum,_]) => pNum !== `${player}`).map(([_, ps]) => getTotalHits(ps.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []))
    return allPlayerHitCount.every((s) => s < totalHits)
  }

  const playerHasWinningScore = (player: number) => {
    const userStats = playerStats[player];
    const otherPlayerStats = Object.entries(playerStats).filter(([pNum,_]) => pNum !== `${player}`).map(([_, ps]) => ps.scoringTotal)
    // Player has least points scored on them
    return otherPlayerStats.every((s) => s > userStats.scoringTotal);
  }

  const playerHasLeastHits = (player: number) => {
    const userStats = playerStats[player];
    // Calculate total hits
    const totalHits: number = getTotalHits(userStats.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []);
    const allPlayerHitCount = Object.entries(playerStats).filter(([pNum,_]) => pNum !== `${player}`).map(([_, ps]) => getTotalHits(ps.scoringNumberStatus, gameData?.config?.scoringNumbers ?? []))
    console.log(`Player #${player} hits ${totalHits}`, allPlayerHitCount);
    return allPlayerHitCount.every((s) => s > totalHits);
  }

  const playerHasLosingScore = (player: number) => {
    const userStats = playerStats[player];
    const otherPlayerStats = Object.entries(playerStats).filter(([pNum,_]) => pNum !== `${player}`).map(([_, ps]) => ps.scoringTotal)
    // Player has more points scored on them
    return otherPlayerStats.every((s) => s < userStats.scoringTotal);
  }

  const isWinner = (player: number) => {
    const userStats = playerStats[player];
    if (!userStats) return false;
    const unfinishedEntries = Object.entries(userStats.scoringNumberStatus).filter(([scoreNum,_]) => (gameData?.config?.scoringNumbers ?? []).includes(parseInt(scoreNum))).filter(([_, hits]) => hits < 3);
    const otherPlayerStats = Object.entries(playerStats).filter(([pNum,_]) => pNum !== `${player}`).map(([_, ps]) => ps.scoringTotal)
    const allScoringNumbersScored = !(gameData?.config?.scoringNumbers ?? []).some((scn) => Object.keys(userStats.scoringNumberStatus).includes(`${scn}`));
    console.log(`Player #${player} left to hit ${unfinishedEntries}`, otherPlayerStats);
    return allScoringNumbersScored && unfinishedEntries?.length === 0 && otherPlayerStats.every((s) => s > userStats.scoringTotal);
  };
  const isLeader = (player: number) => {
    const userStats = playerStats[player];
    if (!userStats) return false;
    return !isWinner(player) && (playerHasWinningScore(player) || playerHasMostHits(player));
  };
  const isLoser = (player: number) => {
    return (
      rounds.length > 1 &&
      !isLeader(player) &&
      (playerHasLosingScore(player) || playerHasLeastHits(player))
    );
  };

  const playerEmoji = (player: number) => {
    if (isWinner(player)) {
      return <>&#128081;</>;
    } else if (isLeader(player)) {
      return <>&#11088;</>;
    } else if (isLoser(player)) {
      return <>&#128169;</>;
    }
    return null;
  };

  const gameOver = Object.keys(gameData.playerStats).some((player) => isWinner(parseInt(player)));

  return (
    <>
      <Formik
        {...formikValidationProps}
        initialValues={emptyFormDefaults}
        validationSchema={Schema}
        onSubmit={handleRootErrors(async (values) => {
          const _newGameData = buildCricketGameData({
            datePlayed: new Date().getTime(),
            scoringNumbers: [...values.scoringNumbers],
            playerCount: values.playerCount ?? 2,
          }, [{}]);
          setGameData(_newGameData);
        })}
      >
        {(formProps) => (
          <Form onSubmit={onFormSubmit(formProps)}>
            <Grid container spacing={2} justify="center">
              <Grid item xs={12}>
                <RootError formProps={formProps} />
              </Grid>
              <Grid item>
                <SelectField
                  field="scoringNumbers"
                  label="Numbers to play"
                  options={
                    [...Array.from(Array(21).keys()), 25].map((number) => ({ value: number, label: `${number}` })) ?? []
                  }
                  multiple
                  className={classes.formField}
                />
                <InputField field="playerCount" label="Players" type="number" inputProps={{ min: 1 }} className={classes.formField} />
                <Button variant="contained" color="primary" type="submit" disabled={formProps.isSubmitting}>
                  Reset game
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}><h2 style={{ textAlign: 'center' }}>[Cut-Throat] Cricket</h2></Grid>
          <Grid item xs={12}>
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
                {Array.from(Array(gameData?.config.playerCount ?? 1).keys()).map((player) => (
                  <tr key={player}>
                    <td>{currentPlayer === player ? '> ' : ''}Player #{player+1}:&#9; {playerEmoji(player)}</td>
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
          <Grid item xs={4}>
            <div style={{ paddingLeft: '20%' }}>{Object.entries(gameData.playerStats).map(([player, stats]) => {
              return (
                <div>
                  <div><b>Player #{parseInt(player)+1}</b></div>
                  <div>
                    <p>Score: {stats.scoringTotal}</p>
                    <p>Rounds: {stats.roundsPlayed}</p>
                    <p>Hits: {Object.entries(stats.scoringNumberStatus).map(([scNum, sc]) => !sc ? '' : `${scNum}: ${sc}, `)}</p>
                  </div>
                </div>
              )
            })}</div>
          </Grid>
          <Grid item xs={4}>
            {!gameOver ? (<div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
              <h2>Current player: #{currentPlayer + 1}</h2>
              <div>
                <DartboardWrapper size={400} onClick={handleDartboardClick} />
              </div>
              <div style={{ marginTop: 20 }}>
                <form onSubmit={addScore}>
                  <input value={dart1} onChange={(evt) => setDart1(evt.target.value)}/>
                  <input value={dart2} onChange={(evt) => setDart2(evt.target.value)}/>
                  <input value={dart3} onChange={(evt) => setDart3(evt.target.value)}/>
                  <input type="submit" value="Save score" />
                </form>
              </div>
            </div>) : (<div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
              <h2>Game over!</h2>
              <p>Winner: Player #{(Object.keys(gameData.playerStats).map(parseInt).find((player) => isWinner(player)) ?? 0) + 1}</p>
            </div>)}
          </Grid>
          <Grid item xs={4}>
            <div style={{ paddingLeft: '20%' }}>
              {rounds.map((round, index) => (
                <div>
                  <div><b>Round #{index + 1}</b></div>
                  <div>
                    {Object.entries(round).map(([playerIndex, scores]) => (
                      <p>
                        <b>Player</b> #{parseInt(playerIndex)+1}&#9;--&#9;{scores.map((scoreBed, index) =>
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
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};
