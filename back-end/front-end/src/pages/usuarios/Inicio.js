import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Footer from '../pie_de_pagina/Footer';
import { Box } from "@mui/material";

import './Inicio.css';


function Inicio() {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        className="drawer" variant="permanent"
        classes={{
          paper: 'drawerPaper'
        }}
      >
        <List>
          <ListItem button>
            <ListItemText primary="Opción 1" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Opción 2" />
          </ListItem>
        </List>
      </Drawer>
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <main className="content">
          <Toolbar className="header" />
          <h1>Bienvenido(a)</h1>
        </main>
        
      </Box>
      <Footer />
    </Box>
  );
}

export default Inicio;
