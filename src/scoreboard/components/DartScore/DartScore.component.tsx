import { DartboardClickDetails } from '../DartboardWrapper';
import {Collapse, Box, Typography, makeStyles} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  scoreWrapper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25),
    border: `2px inset ${theme.palette.background.paper}`,
  }
}));

interface DartScoreProps {
  dart: DartboardClickDetails | null;
}

export const DartScore = ({ dart }: DartScoreProps) => {
  const classes = useStyles();
  return (
    <Collapse in={!!dart} timeout={800}>
      <Box className={classes.scoreWrapper}>
        <Typography>{dart?.bed}</Typography>
      </Box>
    </Collapse>
  )
}