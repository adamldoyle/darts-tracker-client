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
  scoringNumbers: Yup.array().of(Yup.number()).required('Set playable numbers').default([20, 19, 18, 17, 16, 15, 25]),
  playerCount: Yup.number(),
  randomize: Yup.boolean().default(false),
}).required();
type SchemaType = Yup.InferType<typeof Schema>;
const emptyFormDefaults = Schema.getDefault();

const useStyles = makeStyles(() => ({
  formField: {
    maxWidth: 400,
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

const iterateScoresForPlayerRoundScore = (playerStats: Record<number, IPlayerCricketStats>, roundScore: [string, string, string], playerIndex: number) => {
  //Assuming some synchronous code here, we check the 'status' of each player after the calculations are made
  roundScore.forEach((dartThrown) => {
    const hitNumber = getScoringNumberFromBed(dartThrown);
    if (isNaN(hitNumber)) return;
    const currentPlayerScoringStatus = playerStats[playerIndex]?.scoringNumberStatus ?? {};
    if (Object.keys(currentPlayerScoringStatus).includes(`${hitNumber}`)) {
      if ((currentPlayerScoringStatus[hitNumber] ?? 0) > 3) {
        const hitCountWithDart = isDoubleScore(dartThrown) ? 2 : isTripleScore(dartThrown) ? 3 : 1;
        const priorScoresCounted = currentPlayerScoringStatus[hitNumber] ?? 0;
        console.log(`Dart hit with user #${playerIndex} at capacity ${hitNumber}`, hitCountWithDart, priorScoresCounted);
        const playersKeysToIterate = Object.keys(playerStats).filter((pk) => (playerStats[parseInt(pk)].scoringNumberStatus?.[hitNumber] ?? 0) < 3)
        console.log("Iterating scores for other players,", playersKeysToIterate, (playersKeysToIterate && playersKeysToIterate.length > 0) ? playerStats[parseInt(playersKeysToIterate[0])] : 'none');
        playersKeysToIterate.forEach((pk) => {
          console.log("Increasing player score", pk, hitCountWithDart);
          playerStats[parseInt(pk)].scoringTotal += (hitCountWithDart * hitNumber);
        })
      }
    }
  })
}

const buildCricketGameData = (config: {
  datePlayed: number;
  playerCount: number;
  scoringNumbers: (number | undefined)[];
}, rounds: Record<number, [string, string, string]>[]): ICricketGameData => {
  const playerStats = rounds.reduce<Record<number, IPlayerCricketStats>>(
    (acc, round) => {
      Object.entries(round).forEach(([playerIndex, roundScore]) => {
        const playerStats = acc[parseInt(playerIndex)];
        playerStats.scoringNumberStatus = config.scoringNumbers.reduce<Record<number, number>>((scoringNumberStatusAcc, scoringNumber) => {
          if (scoringNumber) {
            const currentNumberOfHits = scoringNumberStatusAcc[scoringNumber] ?? 0
            const addedHits = calculateNumberOfHits(scoringNumber, parseInt(playerIndex) ?? 0, [{ 0: roundScore }]);
            scoringNumberStatusAcc[scoringNumber] = currentNumberOfHits + addedHits;
          }
          return scoringNumberStatusAcc;
        }, playerStats.scoringNumberStatus ?? {});
        iterateScoresForPlayerRoundScore(acc, roundScore, parseInt(playerIndex) ?? 0);
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

  const hasNumberCleared = (playerIndex: number, scoringNumber: number) => {
    return (playerStats[playerIndex]?.scoringNumberStatus[scoringNumber] ?? 0) >= 3;
  };

  const renderPlayerScore = (player: number, scoringNumber: number) => {
    const numberOfHits = calculateNumberOfHits(scoringNumber, player, rounds);
    // FIXME: this is not calculating correctly
    const notClearedPlayers = Array.from(Array(gameData?.config.playerCount ?? 1).keys()).filter(
      (player) => (playerStats[player]?.scoringNumberStatus[scoringNumber] ?? 0) < 3);
    const color = notClearedPlayers.length > 0 ? 'primary' : 'disabled';
    return (
      <>
        {numberOfHits >= 1 ? <RadioButtonChecked color={color} /> : <RadioButtonUnchecked color={color} />}
        {numberOfHits >= 2 ? <RadioButtonChecked color={color} /> : <RadioButtonUnchecked color={color} />}
        {numberOfHits >= 3 ? <RadioButtonChecked color={color} /> : <RadioButtonUnchecked color={color} />}
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
    console.log("Updating game data", newGameData);
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RootError formProps={formProps} />
              </Grid>
              <Grid item xs={4}>
                <SelectField
                  field="scoringNumbers"
                  label="Numbers to play"
                  options={
                    [...Array.from(Array(21).keys()), 25].map((number) => ({ value: number, label: `${number}` })) ?? []
                  }
                  multiple
                  className={classes.formField}
                />
              </Grid>
              <Grid item xs={3}>
                <InputField field="playerCount" label="Players" type="number" inputProps={{ min: 1 }} className={classes.formField} />
              </Grid>
              <Grid item xs={3}>
                <Button variant="contained" color="primary" type="submit" disabled={formProps.isSubmitting}>
                  Reset game
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ textAlign: 'center' }}>Cricket</h2>
          <table style={{ borderWidth: 1, borderStyle: 'solid', width: '100%' }}>
            <thead>
              <tr>
                <td>Players</td>
                {gameData?.config.scoringNumbers.sort().map((scoringNumber) => (
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
                  <td>{currentPlayer === player ? '> ' : ''}Player #{player+1}:&#9;<b>{gameData?.playerStats?.[player]?.scoringTotal ?? 0}</b></td>
                  {gameData?.config.scoringNumbers.map((scoringNumber) => (
                    <td key={`${player}_${scoringNumber}`} style={{ fontWeight: 'bold' }}>
                      {renderPlayerScore(player, scoringNumber ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
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
        <div style={{ flex: '1 0 auto', justifyItems: 'center' }}>
          <h2>Current player: #{currentPlayer + 1}</h2>
          <div style={{ marginTop: 20 }}>
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
        </div>
      </div>
    </>
  );
};
