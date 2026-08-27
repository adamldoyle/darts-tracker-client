import { useEffect, useState } from 'react';
import { GameEvent } from '../../../store/games/types';
import { toast, cssTransition, Bounce } from 'react-toastify';
import { Box, Collapse, makeStyles, Typography } from '@material-ui/core';
import bagOfDicks from '../../../images/bag-of-dicks.gif';
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

const BagOfDicks = () => {
  return (
    <Box display="flex" justifyContent="center">
      <img src={bagOfDicks} alt="bag_of_dicks_text" width="50%" />
    </Box>
  )
}

const CustomWrapperAnimation = ({ title, text }: { title: string; text: string }) => {
  const classes = useStyles();
  return (
    <Box>
      <Collapse in={!!title} timeout={5000}>
        <Box height="200px"></Box>
      </Collapse>
      <Box p={3} className={classes.textSign}>
        <Typography>{title}</Typography>
        <Typography variant="caption">{text}</Typography>
      </Box>
    </Box>
  )
}

export const TickerGameEventsProps = ({events}: TickerGameEventsProps) => {
  const classes = useStyles();
  const [shownEvents, setShownEvents] = useState<string[]>([]);

  // FIXME: we should show events one at a time and delay the entry of subsequent events
  useEffect(() => {
    const _showingEvents: string[] = [];
    events.forEach(event => {
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
        // toast(BagOfDicks, {
        //   position: 'top-left',
        //   transition: Slide,
        //   className: classes.imageToast,
        // });
        // toast(<CustomWrapperAnimation text={event.eventDescription} title={event.eventName} />, {
        //   position: 'top-left',
        //   transition: Bounce,
        //   className: classes.textToast,
        //   hideProgressBar: true,
        //   autoClose: false,
        // });
      }
    });
    setShownEvents((_prev) => [..._prev, ..._showingEvents]);
  }, [events]);

  return (
    <>
    </>
  )
}