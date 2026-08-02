import { DartboardClickDetails } from '../DartboardWrapper';
import {Collapse, Box, Typography, makeStyles} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  scoreWrapper: {
    backgroundColor: '#171717',
    padding: theme.spacing(0.25),
    border: `1px inset ${theme.palette.background.paper}`,
  },
  scoreOuterRight: {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  scoreOuterLeft: {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  }
}));

interface DartScoreProps {
  dart: DartboardClickDetails | null;
  position?: 'default' | 'left' | 'right';
}

export const DartScore = ({ dart, position = 'default' }: DartScoreProps) => {
  const classes = useStyles();
  return (
    <Collapse in={!!dart} timeout={800}>
      <Box className={`${classes.scoreWrapper} ${position === 'right' ? classes.scoreOuterRight : position === 'left' ? classes.scoreOuterLeft : ''}`}>
        <Typography>{dart?.bed}</Typography>
      </Box>
    </Collapse>
  )
}