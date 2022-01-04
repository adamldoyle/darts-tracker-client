import { FC } from 'react';
import { API } from 'aws-amplify';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ILeagueWithMembers } from 'store/leagues/types';
import { handleRootErrors, RootError, InputField, InputFieldList } from 'form/components';
import { useDelayedFormValidation } from 'form/hooks';

const Schema = Yup.object({
  leagueKey: Yup.string().required('League key is required').default(''),
  name: Yup.string().required('Name is required').default(''),
  membership: Yup.array().of(Yup.string().required('Member is required')).default([]),
});

const emptyFormDefaults = Schema.getDefault();
type League = typeof emptyFormDefaults;

export interface EditLeagueModalProps {
  league?: ILeagueWithMembers;
  open: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const EditLeagueModal: FC<EditLeagueModalProps> = ({ league, open, onSubmit, onCancel }) => {
  const { formikValidationProps, onSubmit: onFormSubmit } = useDelayedFormValidation<League>();
  const formDefaults: League = league
    ? {
        leagueKey: league.leagueKey,
        name: league.name,
        membership: league.membership.map(({ email }) => email),
      }
    : emptyFormDefaults;
  return (
    <Dialog open={open} fullWidth={true} maxWidth="sm" onClose={onCancel}>
      <DialogTitle>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="h2">
            {league ? `Edit league` : `Add league`}
          </Typography>
          <IconButton onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Formik
        {...formikValidationProps}
        initialValues={formDefaults}
        validationSchema={Schema}
        onSubmit={handleRootErrors(async (values) => {
          if (!league) {
            await API.post('leagues', '/leagues', {
              body: {
                leagueKey: values.leagueKey,
                name: values.name,
              },
            });
          }
          await API.patch('leagues', `/leagues/${values.leagueKey}/membership`, {
            body: values.membership,
          });
          onSubmit();
        })}
      >
        {(formProps) => (
          <Form onSubmit={onFormSubmit(formProps)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <RootError formProps={formProps} />
                </Grid>
                {!league && (
                  <>
                    <Grid item xs={12}>
                      <InputField field="leagueKey" label="League key" />
                    </Grid>
                    <Grid item xs={12}>
                      <InputField field="name" label="Name" />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <InputFieldList label="Membership" field="membership" rowLabel="Member" />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="default" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit" disabled={formProps.isSubmitting}>
                Save
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
