import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession, clearCookies } from '../../store/authSlice';
import { Box, AppBar, Drawer, CssBaseline, List, ListItem, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer";
import { Outlet, useLocation } from 'react-router-dom';
import { pathToRegexp } from 'path-to-regexp';

const drawerWidth = 240;

function InicioAdmin() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    sessionStorage.clear();
    navigate('/');
  };

  const [activeButton, setActiveButton] = useState(null);
  const buttonColors = {
    usuarios: activeButton === "usuarios" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    proyectos: activeButton === "proyectos" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    estudiantes: activeButton === "estudiantes" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
  };

  const handleClick = (button) => {
    setActiveButton(button);
    if (button === "usuarios") {
      navigate('/admin')
    } else if (button === "proyectos") {
      navigate('/admin/proyectos')
    } else if (button === "estudiantes") {
      navigate('/admin/estudiantes')
    }
  };

  useEffect(() => {
    const isVerProyectoPath = (path) => {
      const pattern = pathToRegexp('/admin/verProyecto');
      return pattern.test(path);
    };

    if (
      location.pathname === '/admin'
    ) {
      setActiveButton('usuarios');

    } else if (
      location.pathname === '/admin/proyectos' ||
      isVerProyectoPath(location.pathname)
    ) {
      setActiveButton('proyectos');
    } else if (
      location.pathname === '/admin/estudiantes'
    ) {
      setActiveButton('estudiantes');
    }
  }, [location.pathname]);

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
                  <ListItemButton onClick={() => handleClick("usuarios")} sx={{
                    backgroundColor: buttonColors.usuarios,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="USUARIOS" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("proyectos")} sx={{
                    backgroundColor: buttonColors.proyectos,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="PROYECTOS" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("estudiantes")} sx={{
                    backgroundColor: buttonColors.estudiantes,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="ESTUDIANTES" sx={{ color: '#576A3D' }} />
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

export default InicioAdmin;