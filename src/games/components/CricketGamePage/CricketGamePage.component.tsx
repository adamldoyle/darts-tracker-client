import { FC, FormEvent, useCallback, useState } from 'react';
import { Button, FormControl, FormHelperText, Grid, makeStyles, TextField, Typography } from '@material-ui/core';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import shuffle from 'lodash.shuffle';
import { handleRootErrors, RootError, InputField, SelectField, CheckboxField } from 'form/components';
import { useDelayedFormValidation } from 'form/hooks';
import { IAllPlayerGameStats, ICricketGameData, IGameData, IPlayerCricketStats, IRounds } from 'store/games/types';
// import { Autocomplete } from '@material-ui/lab';
import { Cancel, Clear, RadioButtonChecked, RadioButtonUnchecked } from '@material-ui/icons';
import { DartboardClickDetails, DartboardWrapper, DartsToClose, saveGame } from '../../../scoreboard/components';
import { buildGameData, calculatePlayerStats } from '../../../store/games/helpers';

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

export interface CricketGamePageProps {}

const parseScore = (rawScore: string): number => {
  const score = parseInt(rawScore);
  if (isNaN(score)) {
    return 0;
  }
  return score;
};

interface SelectOption { label: string, value: string };

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
    (player) => {
      console.log(`Stats: ${playerStats[player]?.roundsPlayed}, Player: ${player}, rounds: ${rounds.length}, yet to go: ${playerStats[player]?.roundsPlayed ?? 0 !== rounds.length}`);
      return (playerStats[player]?.roundsPlayed ?? 0) !== rounds.length
    },
  );
  console.log("Current player", gameData?.config.playerCount, remainingRoundPlayers, rounds);
  const currentPlayer = remainingRoundPlayers[0];


  const renderPlayerScore = (player: number, scoringNumber: number) => {
    const playerScores = gameData?.rounds.map((round) => {
      return round[player];
    }).flat();
    const matchingScores = playerScores?.filter((score) => scoringNumber === 25 ? (score?.endsWith(`25`) || score?.endsWith(`50`)) : score?.endsWith(`${scoringNumber}`)) ?? [];
    let numberOfHits = 0;
    matchingScores.forEach((score) => {
      if (!score) return;
      if (score.startsWith('S')) {
        numberOfHits++;
      } else if (score.startsWith('D')) {
        numberOfHits = numberOfHits + 2;
      } else if (score.startsWith('T')) {
        numberOfHits = numberOfHits + 3;
      }
    });
    return (
      <>
        {numberOfHits >= 1 ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
        {numberOfHits >= 2 ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
        {numberOfHits >= 3 ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
      </>
    );
  }

  const saveScore = async (_newScore: string[]) => {
    if (saving) {
      return;
    }
    const buildCricketGameData = (config: {
      datePlayed: number;
      playerCount: number;
      scoringNumbers: (number | undefined)[];
    }, rounds: Record<number, [string, string, string]>[]): ICricketGameData => {
      const playerStats = rounds.reduce<Record<number, IPlayerCricketStats>>(
        (acc, round) => {
          Object.entries(round).forEach(([playerIndex, roundScore]) => {
            const playerStats = acc[parseInt(playerIndex)] ?? { roundsPlayed: 0};
            playerStats.roundsPlayed++;
          });
          return acc;
        },
        Array.from(Array(config.playerCount).keys()).reduce<Record<number, IPlayerCricketStats>>((acc, player) => {
          acc[player ?? 0] = {
            roundsPlayed: 0,
          };
          return acc;
        }, {})
      );
      console.log("Calculated player stats", playerStats);
      const _gameData: ICricketGameData = { config, rounds, playerStats };
      if (
        !Object.values(_gameData.playerStats).find(
          (stats) => stats.roundsPlayed < (gameData?.rounds.length ?? 0),
        )
      ) {
        _gameData.rounds.push({});
      }
      return _gameData;
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
      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 0 min-content', overflowX: 'scroll', maxWidth: '100%' }}>
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
                        // textDecoration: gameData.config.forfeits?.includes(player) ? 'line-through' : undefined,
                      }}
                    >
                      {scoringNumber === 25 ? 'Bull' : scoringNumber}
                    </div>
                  </td>
                ))}
              {/*  FIXME: running score?*/}
              </tr>
            </thead>
            <tbody>
              {Array.from(Array(gameData?.config.playerCount ?? 1).keys()).map((player) => (
                <tr key={player}>
                  <td>{<input type="text" className={classes.formField} />}</td>
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
        {/* running list of round scores, highlighting hits/scores*/}
        <div style={{ flex: '1 0 auto' }}>
          <h2>Current player</h2>
          <div style={{ marginTop: 20 }}>
            <form onSubmit={addScore}>
              <input value={dart1} onChange={(evt) => setDart1(evt.target.value)}/>
              <input value={dart2} onChange={(evt) => setDart2(evt.target.value)}/>
              <input value={dart3} onChange={(evt) => setDart3(evt.target.value)}/>
              <input type="submit" value="Save score" />
            </form>
          </div>
          <div style={{ marginTop: 20 }}>
            <DartboardWrapper size={400} onClick={handleDartboardClick} />
          </div>
        </div>
        <div>
          {rounds.map((round, index) => (
            <div>
              <div>Round {index + 1}</div>
              <div>
                {Object.entries(round).map(([playerIndex, scores]) => (
                  <div>
                    Player {playerIndex} scores: {scores.toString()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Formik
        {...formikValidationProps}
        initialValues={emptyFormDefaults}
        validationSchema={Schema}
        onSubmit={handleRootErrors(async (values) => {
          const playerStats = Array.from(Array(gameData?.config.playerCount ?? 1).keys()).reduce<Record<number, IPlayerCricketStats>>((acc, player) => {
            acc[player ?? 0] = {
              roundsPlayed: 0,
            };
            return acc;
          }, {});
          setGameData((existing) => ({
            config: {
              datePlayed: existing?.config.datePlayed ?? new Date().getTime(),
              scoringNumbers: [...values.scoringNumbers],
              playerCount: values.playerCount,
            },
            rounds: [{}],
            playerStats: playerStats,
          } as ICricketGameData));
        })}
      >
        {(formProps) => (
          <Form onSubmit={onFormSubmit(formProps)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RootError formProps={formProps} />
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <InputField field="playerCount" label="Players" type="number" inputProps={{ min: 1 }} className={classes.formField} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit" disabled={formProps.isSubmitting}>
                  Reset game
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};
