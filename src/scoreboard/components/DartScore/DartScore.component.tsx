import { DartboardClickDetails } from '../DartboardWrapper';
import {Collapse, Box, Typography, makeStyles} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  scoreWrapper: {
    backgroundColor: '#171717',
    padding: theme.spacing(0.25),
    border: `1px inset ${theme.palette.background.paper}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      cursor: 'pointer',
      background: `linear-gradient(0deg, #171717, 30%, ${theme.palette.background.paper})`,
    },
  },
  scoreOuterRight: {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  scoreOuterLeft: {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
  selected: {
    transform: 'scale(1.5)',
    background: `linear-gradient(0deg, ${theme.palette.secondary.dark}, 10%, ${theme.palette.grey[500]})`,
  },
  disabled: {
    color: theme.palette.grey[500],
    background: `linear-gradient(0deg, #171717, 30%, ${theme.palette.grey[500]})`,
  },
}));

interface DartScoreProps {
  dart: DartboardClickDetails | null;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  position?: 'default' | 'left' | 'right';
  className?: string;
}

export const DartScore = ({ dart, onClick, disabled = false, selected = false, className = '', position = 'default' }: DartScoreProps) => {
  const classes = useStyles();
  return (
    <Collapse in={!!dart} timeout={500}>
      <Box onClick={onClick} className={`${classes.scoreWrapper} ${position === 'right' ? 
        classes.scoreOuterRight : position === 'left' ? classes.scoreOuterLeft : ''} ${
        disabled ? classes.disabled : selected ? classes.selected : ''} ${className}`}>
        <Typography>{dart?.bed}</Typography>
      </Box>
    </Collapse>
  )
}