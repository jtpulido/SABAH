<<<<<<< Updated upstream
import * as React from 'react';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession,clearCookies } from '../../store/authSlice';
import { Box, AppBar, Drawer, CssBaseline, List, ListItem, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer"
>>>>>>> Stashed changes
import "./InicioCmt.css";

const drawerWidth = 240;

function InicioCmt() {
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

    </div>
  );

<<<<<<< Updated upstream
  return (
    <Box sx={{ display: 'flex' }}>
=======
  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    fetch('http://localhost:5000/logout', { method: 'GET' });
    navigate('/')
  };

  const [activeButton, setActiveButton] = useState(null);
  const buttonColors = {
    proyecto: activeButton === "proyecto" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    lector: activeButton === "lector" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
  };
>>>>>>> Stashed changes

      <Box sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="permanent" sx={{ display: 'block', '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, }} open        >
          {drawer}
        </Drawer>

      </Box>

      <Box
        sx={{ p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', display: 'flex', flexDirection: 'column', }}      >
        <Typography paragraph>
          Inicio Comite
        </Typography>

      </Box>

    </Box>
  );
}

export default InicioCmt;