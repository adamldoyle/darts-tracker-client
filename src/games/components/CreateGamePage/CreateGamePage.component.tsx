import { FC } from 'react';
import { v4 as uuid } from 'uuid';
import { API } from 'aws-amplify';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Grid, makeStyles } from '@material-ui/core';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import shuffle from 'lodash.shuffle';
import { handleRootErrors, RootError, InputField, SelectField, CheckboxField } from 'form/components';
import { useDelayedFormValidation } from 'form/hooks';
import { selectors as leagueSelectors } from 'store/leagues/slice';
import { IGameData } from 'store/games/types';
import { calculatePlayerStats } from 'store/games/helpers';
import { hooks as gameHooks } from 'store/games/slice';

const Schema = Yup.object({
  goal: Yup.number().required('Goal is required').min(1).default(301),
  players: Yup.array().of(Yup.string()).default([]),
  randomize: Yup.boolean().default(false),
}).required();
type SchemaType = Yup.InferType<typeof Schema>;
const emptyFormDefaults = Schema.getDefault();

const useStyles = makeStyles(() => ({
  formField: {
    maxWidth: 400,
  },
}));

export interface CreateGamePageProps {}

export const CreateGamePage: FC<CreateGamePageProps> = () => {
  const classes = useStyles();
  const history = useHistory();

  const selectedLeague = useSelector(leagueSelectors.selectSelectedLeague);
  const { makeStale: makeGamesStale } = gameHooks.useMonitoredData();
  const { formikValidationProps, onSubmit: onFormSubmit } = useDelayedFormValidation<SchemaType>();

  return (
    <Formik
      {...formikValidationProps}
      initialValues={emptyFormDefaults}
      validationSchema={Schema}
      onSubmit={handleRootErrors(async (values) => {
        const saveGameId = uuid();
        const gameData: IGameData = {
          config: {
            datePlayed: new Date().getTime(),
            goal: values.goal,
            players: values.randomize ? shuffle([...values.players]) : values.players,
          },
          rounds: [{}],
          playerStats: {},
        };
        calculatePlayerStats(gameData);
        await API.put('leagues', `/leagues/${selectedLeague?.leagueKey}/games/${saveGameId}`, {
          body: gameData,
        });
        makeGamesStale();

        history.replace(`/game/${saveGameId}`);
      })}
    >
      {(formProps) => (
        <Form onSubmit={onFormSubmit(formProps)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RootError formProps={formProps} />
            </Grid>
            <Grid item xs={12}>
              <InputField field="goal" label="Goal" type="number" className={classes.formField} />
            </Grid>
            <Grid item xs={12}>
              <SelectField
                field="players"
                label="Players"
                options={
                  selectedLeague?.membership.map((member) => ({ value: member.email, label: member.email })) ?? []
                }
                multiple
                className={classes.formField}
              />
            </Grid>
            <Grid item xs={12}>
              <CheckboxField field="randomize" label="Randomize players" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" disabled={formProps.isSubmitting}>
                Create game
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
