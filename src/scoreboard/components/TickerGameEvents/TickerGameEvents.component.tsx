import { useCallback, useEffect, useState } from 'react';
import { GameEvent } from '../../../store/games/types';
import { toast, Bounce } from 'react-toastify';
import { makeStyles } from '@material-ui/core';
import './static.css';

const useStyles = makeStyles((theme) => ({
  basicEvent: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  imageToast: {
    width: '500px',
    height: '500px',
    background: `radial-gradient(circle at center, ${theme.palette.grey[500]} 0, transparent 65%)`,
    boxShadow: 'none',
  },
  textToast: {
    background: 'transparent',
    boxShadow: 'none',
  },
  textSign: {
    borderRadius: theme.spacing(1),
    border: `2px inset ${theme.palette.grey[500]}`,
    backgroundColor: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
  },
}));

interface TickerGameEventsProps {
 events: GameEvent[];
}

const getEventId = (event: GameEvent) => {
  return `${event.roundInfo.round}_${event.roundInfo.player}_${event.roundInfo.dart ?? 'none'}_${event.eventName}`
}

export const TickerGameEvents = ({events}: TickerGameEventsProps) => {
  const classes = useStyles();
  const [shownEvents, setShownEvents] = useState<string[]>([]);

  const setOffEventRenders = useCallback((_events: GameEvent[]) => {
    const _showingEvents: string[] = [];
    _events.forEach(event => {
      const eventId = getEventId(event);
      if (!shownEvents.includes(eventId)) {
        _showingEvents.push(eventId);
        toast(`${event.eventName}: ${event.eventDescription}`, {
          position: 'bottom-left',
          className: classes.basicEvent,
          transition: Bounce,
          hideProgressBar: true,
          delay: 500*(_showingEvents.length),
        });
      }
    });
    setShownEvents((_prev) => [..._prev, ..._showingEvents]);
  },[shownEvents, classes.basicEvent]);

  useEffect(() => {
    setOffEventRenders(events);
  }, [events, setOffEventRenders]);

  return (
    <>
    </>
  )
}