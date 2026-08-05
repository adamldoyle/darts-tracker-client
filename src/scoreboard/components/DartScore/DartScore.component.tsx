import { DartboardClickDetails } from '../DartboardWrapper';
import { Collapse, Box, Typography, makeStyles } from '@material-ui/core';
import { GameEvent, RoundInfo } from '../../../store/games/types';
import { useMemo } from 'react';
import { getIsSameRound } from '../../../store/games/helpers';

const useStyles = makeStyles((theme) => ({
  scoreWrapper: {
    backgroundColor: '#171717',
    padding: theme.spacing(1),
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
  hit: {
    backgroundColor: theme.palette.success.dark,
  },
  score: {
    color: '#FFD85D',
  }
}));

interface DartScoreProps {
  dart: DartboardClickDetails | null;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  position?: 'default' | 'left' | 'right';
  className?: string;
  gameEvents?: GameEvent[];
  roundInfo?: RoundInfo;
}

// FIXME: Add color border on top for designated player

export const DartScore = ({ dart, onClick, roundInfo, gameEvents, disabled = false, selected = false, className = '', position = 'default' }: DartScoreProps) => {
  const classes = useStyles();
  const myEvents = useMemo(() => {
    return gameEvents?.filter((ge) => getIsSameRound(ge.roundInfo, roundInfo)) ?? [];
  }, [gameEvents, roundInfo]);

  const isScoring = myEvents?.some((ge) => ge.eventName === 'Score');
  const isCricketHit = myEvents?.some((ge) => ge.eventName === 'Hit');

  return (
    <Collapse in={!!dart} timeout={500}>
      <Box onClick={onClick} className={`${classes.scoreWrapper} ${position === 'right' ? 
        classes.scoreOuterRight : position === 'left' ? classes.scoreOuterLeft : ''} ${
        disabled ? classes.disabled : selected ? classes.selected : ''} ${className} ${
        isScoring ? classes.score : ''} ${isCricketHit ? classes.hit : ''}`}>
        <Typography>{dart?.bed}</Typography>
      </Box>
    </Collapse>
  )
}