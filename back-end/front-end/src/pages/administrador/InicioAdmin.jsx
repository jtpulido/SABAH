import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession, clearCookies } from '../../store/authSlice';
import { Box, AppBar, Drawer, CssBaseline, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer"
import "./InicioAdmin.css";
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
    navigate('/')
  };

  const [activeButton, setActiveButton] = useState(null);
  const buttonColors = {
    usuarios: activeButton === "usuarios" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    proyectos: activeButton === "proyectos" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
  };

  const handleClick = (button) => {
    setActiveButton(button);
    if (button === "usuarios") {
      // Cambiar
      navigate('/admin')
      // Cambiar
    } else if (button === "proyectos") {
      navigate('/admin/proyectos')
    }
  };

  useEffect(() => {
    const isVerUsuarioPath = (path) => {
      const pattern = pathToRegexp('/admin/verUsuario/:id');
      return pattern.test(path);
    };

    const isModificarUsuarioPath = (path) => {
      const pattern = pathToRegexp('/admin/modificarUsuario/:id');
      return pattern.test(path);
    };

    const isVerProyectoPath = (path) => {
      const pattern = pathToRegexp('/admin/verProyecto/:id');
      return pattern.test(path);
    };

    const isModificarProyectoPath = (path) => {
      const pattern = pathToRegexp('/admin/modificarProyecto/:id');
      return pattern.test(path);
    };

    if (
      location.pathname === '/admin' ||
      location.pathname === '/admin/agregarUsuario' ||
      isVerUsuarioPath(location.pathname) || isModificarUsuarioPath(location.pathname)
    ) {
      setActiveButton('usuarios');
    } else if (
      location.pathname === '/admin/proyectos' ||
      isVerProyectoPath(location.pathname) || isModificarProyectoPath(location.pathname)
    ) {
      setActiveButton('proyectos');
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