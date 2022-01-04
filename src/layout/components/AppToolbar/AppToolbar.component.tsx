import React, { useState, useContext, FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Divider,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  SwipeableDrawer,
  makeStyles,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import EventIcon from '@material-ui/icons/Event';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { AuthContext } from '@adamldoyle/react-aws-auth-context';
import { selectors } from 'store/leagues/slice';

const useStyles = makeStyles((theme) => ({
  appBar: { borderBottom: `1px solid ${theme.palette.divider}` },
  toolbar: { flexWrap: 'wrap' },
  toolbarTitle: { flexGrow: 1 },
  link: { margin: theme.spacing(1, 1.5) },
  toolbarOffset: { ...theme.mixins.toolbar, minHeight: 48 },
  container: {},
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

interface MenuLinkProps {
  title: string;
  to: string;
  Icon: React.ComponentType;
  disabled?: boolean;
}

const MenuLink: FC<MenuLinkProps> = ({ title, to, Icon, disabled }) => {
  return (
    <ListItem button component={RouterLink} to={to} disabled={disabled}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={title} />
    </ListItem>
  );
};

export interface AppToolbarProps {}

export const AppToolbar: FC<AppToolbarProps> = () => {
  const classes = useStyles();

  const { signOut } = useContext(AuthContext);
  const selectedLeague = useSelector(selectors.selectSelectedLeague);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed" color="default" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar} variant="dense">
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" color="inherit" noWrap className={classes.toolbarTitle}>
            {selectedLeague?.name ?? 'Dart Tracker'}
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbarOffset} />
      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        onClick={() => setMenuOpen(false)}
      >
        <List>
          {selectedLeague && (
            <>
              <ListItem>
                <Typography variant="h6" component="h2">
                  {selectedLeague.name}
                </Typography>
              </ListItem>
              <Divider />
            </>
          )}
          <MenuLink title="Game" to="/game" Icon={AddCircleOutlineIcon} disabled={selectedLeague === null} />
          <Divider />
          <MenuLink title="Change league" to="/leagues" Icon={SwapHorizIcon} />
          <Divider />
          <ListItem button onClick={signOut}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </ListItem>
        </List>
      </SwipeableDrawer>
    </>
  );
};
