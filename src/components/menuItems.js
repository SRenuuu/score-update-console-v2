import * as React from 'react';
import { Link } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import CommentIcon from '@mui/icons-material/Comment';
import SportsHandballIcon from '@mui/icons-material/SportsHandball';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

export const menuItems = (
  <React.Fragment>
    <ListItemButton component={Link} to="/">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItemButton>
    <ListItemButton component={Link} to="/wicket">
      <ListItemIcon>
        <SportsHandballIcon />
      </ListItemIcon>
      <ListItemText primary="Wicket" />
    </ListItemButton>
    <ListItemButton component={Link} to="/setup">
      <ListItemIcon>
        <CommentIcon />
      </ListItemIcon>
      <ListItemText primary="Commentry" />
    </ListItemButton>
    <ListItemButton component={Link} to="/players">
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Players" />
    </ListItemButton>
    <ListItemButton component={Link} to="/innings">
      <ListItemIcon>
        <SportsCricketIcon />
      </ListItemIcon>
      <ListItemText primary="Innings" />
    </ListItemButton>
    <ListItemButton component={Link} to="/setup">
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Setup" />
    </ListItemButton>
    <ListItemButton component={Link} to="/notifications">
      <ListItemIcon>
        <NotificationsActiveIcon />
      </ListItemIcon>
      <ListItemText primary="Notifications" />
    </ListItemButton>
  </React.Fragment>
);