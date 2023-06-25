import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession, clearCookies } from '../../store/authSlice';
import { Box, AppBar, Drawer, CssBaseline, List, ListItem, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer"
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

function InicioCmt() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    navigate('/')
  };

  const [activeButton, setActiveButton] = useState(null);
  const buttonColors = {
    proyecto: activeButton === "proyecto" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    lector: activeButton === "lector" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    director: activeButton === "director" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    jurado: activeButton === "jurado" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    entrega: activeButton === "entrega" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    solicitud: activeButton === "solicitud" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    rubricas: activeButton === "rubricas" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)"
  };

  const handleClick = (button) => {
    setActiveButton(button);
    if (button === "proyecto") {
      navigate('/comite')
    } else if (button === "director") {
      navigate('/comite/directores')
    } else if (button === "lector") {
      navigate('/comite/lectores')
    } else if (button === "jurado") {
      navigate('/comite/jurados')
    } else if (button === "solicitud") {
      navigate('/comite/solicitudes')
    } else if (button === "entrega") {
      navigate('/comite/entregas')
    } else if (button === "rubricas") {
      navigate('/comite/rubricas')
    }
  };
  return (<div><CssBaseline />
    <Box sx={{ display: 'flex', height: 'calc(100vh - 50px)' }} >
      <Box sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <ThemeProvider
          theme={createTheme({
            components: {
              MuiListItemButton: {
                defaultProps: {
                  disableTouchRipple: true,
                },
              },
            },
            palette: {
              primary: { main: 'rgb(184, 207, 105)' },
            },
          })}
        >
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Toolbar> <img src={logo} alt="" style={{ width: '200px' }} /></Toolbar>
            <Box sx={{ overflow: 'auto', ml: 2 }}>
              <List >
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("proyecto")} sx={{
                    backgroundColor: buttonColors.proyecto,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="PROYECTOS" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("director")} sx={{
                    backgroundColor: buttonColors.director,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="DIRECTORES" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("lector")} sx={{
                    backgroundColor: buttonColors.lector,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="LECTORES" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("jurado")} sx={{
                    backgroundColor: buttonColors.jurado,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="JURADOS" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("solicitud")} sx={{
                    backgroundColor: buttonColors.solicitud,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="SOLICITUDES" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("rubricas")} sx={{
                    backgroundColor: buttonColors.rubricas,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="RUBRICAS" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding >
                  <ListItemButton onClick={() => cerrarSesion()} >
                    <ListItemText primary="CERRAR SESIÓN" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>

              </List>

            </Box>

            <Toolbar />
          </Drawer>
        </ThemeProvider>
      </Box>
      <Box component="main" sx={{ p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, overflow: 'auto', minHeight: '100%' }}>
        <Outlet />

      </Box>

    </Box>

    <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Footer />
    </AppBar>
  </div >
  );
}

export default InicioCmt;