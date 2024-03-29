import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession, clearCookies } from '../../store/authSlice';
import {
  Box,
  AppBar,
  Drawer,
  CssBaseline,
  useTheme,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer"
import { Outlet, useLocation } from 'react-router-dom';
import { tokens } from "../../theme";

const drawerWidth = 240;

const menuItems = [
  { label: "PROYECTOS", button: "proyecto" },
  { label: "SUSTENTACIONES", button: "sustentaciones" },
  { label: "PROYECTOS MERITORIOS", button: "proyectos/meritorios" },
  { label: "DIRECTORES", button: "director" },
  { label: "LECTORES", button: "lector" },
  { label: "JURADOS", button: "jurado" },
  { label: "ASPECTOS", button: "aspectos" },
  { label: "RUBRICAS", button: "rubricas" },
  { label: "ESPACIOS", button: "espacio" },
  { label: "ENTREGAS", button: "entregas" },
  { label: "SOLICITUDES", button: "solicitudes" },
  { label: "REPORTES", button: "reportes" },
  { label: "REUNIONES", button: "reuniones" },
  { label: "CERRAR SESIÓN", button: "cerrarSesion" }
];

function InicioCmt() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    navigate('/');
  };

  const [activeButton, setActiveButton] = useState(null);

  const handleClick = (button) => {
    setActiveButton(button);
    if (button === "cerrarSesion") {
      cerrarSesion();
    } else {
      navigate(`/comite/${button}`);
    }
  };

  useEffect(() => {
    if (location.pathname === '/comite') {
      setActiveButton('proyecto');

    } else if (location.pathname === '/comite/director') {
      setActiveButton('director');

    } else if (location.pathname === '/comite/lector') {
      setActiveButton('lector');

    } else if (location.pathname === '/comite/jurado') {
      setActiveButton('jurado');

    } else if (location.pathname === '/comite/aspectos') {
      setActiveButton('aspectos');

    } else if (location.pathname === '/comite/rubricas') {
      setActiveButton('rubricas');

    } else if (location.pathname === '/comite/espacio') {
      setActiveButton('espacio');

    } else if (location.pathname === '/comite/entregas') {
      setActiveButton('entregas');

    } else if (location.pathname === '/comite/solicitudes') {
      setActiveButton('solicitudes');

    } else if (location.pathname === '/comite/reportes') {
      setActiveButton('reportes');

    } else if (location.pathname === '/comite/reuniones') {
      setActiveButton('reuniones');

    } else if (location.pathname === '/comite/sustentaciones') {
      setActiveButton('sustentaciones');

    } else if (location.pathname === '/comite/proyectos/meritorios') {
      setActiveButton('proyectos/meritorios');

    }
  }, [location.pathname]);

  return (
    <div>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 55px)' }}>
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
              <Toolbar>
                <img src={logo} alt="Logo" style={{ width: '100%', height: 'auto', maxHeight: '50px' }} />
              </Toolbar>
              <Box sx={{ overflow: 'auto' }}>
                <List>
                  {menuItems.map((menuItem, index) => (
                    <React.Fragment key={index}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            handleClick(menuItem.button);
                          }}
                          sx={{
                            backgroundColor: activeButton === menuItem.button ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
                            "&:hover": {
                              backgroundColor: "rgb(184, 207, 105)",
                            },
                          }}
                        >
                          <ListItemText primary={menuItem.label} sx={{ color: colors.primary[100] }} />
                        </ListItemButton>
                      </ListItem>

                    </React.Fragment>
                  ))}
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
    </div>
  );
}

export default InicioCmt;
