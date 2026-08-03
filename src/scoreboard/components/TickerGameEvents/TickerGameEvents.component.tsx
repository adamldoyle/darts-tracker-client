import { useEffect, useState } from 'react';
import { GameEvent } from '../../../store/games/types';
import { toast, Slide } from 'react-toastify';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  basicEvent: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}));

interface TickerGameEventsProps {
 events: GameEvent[];
}

const getEventId = (event: GameEvent) => {
  return `${event.roundInfo.round}_${event.roundInfo.player}_${event.roundInfo.dart ?? 'none'}_${event.eventName}`
}

export const TickerGameEventsProps = ({events}: TickerGameEventsProps) => {
  const classes = useStyles();
  const [shownEvents, setShownEvents] = useState<string[]>([]);

  useEffect(() => {
    const _showingEvents: string[] = [];
    events.forEach(event => {
      const eventId = getEventId(event);
      if (!shownEvents.includes(eventId)) {
        _showingEvents.push(eventId);
        toast.info(`${event.eventName}: ${event.eventDescription}`, {
          position: 'bottom-center',
          className: classes.basicEvent,
          transition: Slide,
        });
      }
    });
    setShownEvents((_prev) => [..._prev, ..._showingEvents]);
  }, [events]);

  return (
    <>
    </>
  )
}