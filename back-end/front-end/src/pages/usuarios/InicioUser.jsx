import React, { useState, useEffect, useCallback } from 'react';
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
  Collapse,
  ListItemButton,
  ListItemText,
  Toolbar
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer";
import { Outlet, useLocation } from 'react-router-dom';
import { tokens } from "../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";

const drawerWidth = 240;

function InicioUser() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const idUsuario = sessionStorage.getItem('id_usuario');
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [subMenuStates, setSubMenuStates] = useState({});

  const handleSubMenuClick = (button) => {
    setSubMenuStates((prevState) => ({
      ...prevState,
      [button]: !prevState[button],
    }));
  };

  const [isDirector, setIsDirector] = useState(false);
  const [isLector, setIsLector] = useState(false);
  const [isJurado, setIsJurado] = useState(false);

  const rolDirector = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/rolDirector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: idUsuario }),
      });

      const data = await response.json();
      if (!data.success) {
        setIsDirector(false);
      } else {
        setIsDirector(true);
      }
    } catch (error) { }
  }, [idUsuario, token]);

  const rolLector = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/rolLector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: idUsuario }),
      });

      const data = await response.json();
      if (!data.success) {
        setIsLector(false);
      } else {
        setIsLector(true);
      }
    } catch (error) { }
  }, [idUsuario, token]);

  const rolJurado = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/rolJurado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: idUsuario }),
      });

      const data = await response.json();
      if (!data.success) {
        setIsJurado(false);
      } else {
        setIsJurado(true);
      }
    } catch (error) { }
  }, [idUsuario, token]);

  useEffect(() => {
    rolDirector();
    rolJurado();
    rolLector();
  }, [rolDirector, rolJurado, rolLector]);

  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    sessionStorage.removeItem('id_usuario');
    navigate('/');
  };

  const [activeButton, setActiveButton] = useState('');

  const buttonColors = {
    menuInicio: activeButton === 'menuInicio' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    proyectos: activeButton === 'proyectos' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    reuniones: activeButton === 'reuniones' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    solicitudes: activeButton === 'solicitudes' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    cerrarSesion: activeButton === 'cerrarSesion' ? '#ffffff' : '#ffffff',
  };

  const handleClick = (button) => {
    setActiveButton(button);
    
    if (button === 'menuInicio') {
      navigate('');

    } else if (button === 'reuniones') {
      navigate('/user/reuniones');

    } else if (button === 'solicitudes') {
      navigate('/user/solicitudes');

    } else if (button === 'cerrarSesion') {
      cerrarSesion();

    } else if (button === 'directorProyectos') {
      sessionStorage.setItem('id_rol', 1);
      setActiveButton('directorProyectos');
      navigate('/user/proyectos');

    } else if (button === 'lectorProyectos') {
      sessionStorage.setItem('id_rol', 2);
      navigate('/user/proyectos');

    } else if (button === 'juradoProyectos') {
      sessionStorage.setItem('id_rol', 3);
      navigate('/user/proyectos');
    }
  };

  const menuItems = [
    { label: 'INICIO', button: 'menuInicio' },
    {
      label: 'PROYECTOS',
      button: 'proyectos',
      subItems: [
        { label: 'DIRECTOR', button: 'directorProyectos', show: isDirector },
        { label: 'LECTOR', button: 'lectorProyectos', show: isLector },
        { label: 'JURADO', button: 'juradoProyectos', show: isJurado },
      ],
    },
    {
      label: 'REUNIONES',
      button: 'reuniones',
      subItems: [
        { label: 'DIRECTOR', button: 'directorReuniones', show: isDirector },
        { label: 'LECTOR', button: 'lectorReuniones', show: isLector },
        { label: 'JURADO', button: 'juradoReuniones', show: isJurado },
      ],
    },
    {
      label: 'SOLICITUDES',
      button: 'solicitudes',
      subItems: [
        { label: 'DIRECTOR', button: 'directorSolicitudes', show: isDirector },
        { label: 'LECTOR', button: 'lectorSolicitudes', show: isLector },
        { label: 'JURADO', button: 'juradoSolicitudes', show: isJurado },
      ],
    },
    { label: 'CERRAR SESIÓN', button: 'cerrarSesion', action: cerrarSesion, buttonColors: '#576A3D', onClick: cerrarSesion },
  ];

  useEffect(() => {
    if (location.pathname === '/user') {
      setActiveButton('menuInicio');
    } else if (location.pathname === '/user/proyectos') {
      setActiveButton('proyectos');
    } else if (location.pathname === '/user/solicitudes') {
      setActiveButton('solicitudes');
    }

  }, [location.pathname]);

  return (
    <div>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 50px)' }}>
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
                            if (menuItem.subItems) {
                              handleSubMenuClick(menuItem.button);
                            } else {
                              handleClick(menuItem.button);
                            }
                          }}
                          sx={{
                            backgroundColor: buttonColors[menuItem.button],
                            '&:hover': {
                              backgroundColor: 'rgb(184, 207, 105)',
                            },
                          }}
                        >
                          <ListItemText primary={menuItem.label} sx={{ color: colors.primary[100] }} />
                          {menuItem.subItems && (subMenuStates[menuItem.button] ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                      </ListItem>
                      {menuItem.subItems && (
                        <Collapse
                          in={subMenuStates[menuItem.button]}
                          timeout="auto"
                          unmountOnExit
                          sx={{ ml: '30px' }}
                        >
                          {menuItem.subItems
                            .filter((subItem) => subItem.show)
                            .map((subItem, subIndex) => (
                              <ListItem disablePadding key={subIndex}>
                                <ListItemButton
                                  onClick={() => handleClick(subItem.button)}
                                  sx={{
                                    backgroundColor: buttonColors[subItem.button],
                                    '&:hover': {
                                      backgroundColor: 'rgb(184, 207, 105)',
                                    },
                                  }}
                                >
                                  <ListItemText primary={subItem.label} sx={{ color: colors.primary[100] }} />
                                </ListItemButton>
                              </ListItem>
                            ))}
                        </Collapse>
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
              <Toolbar />
            </Drawer>
          </ThemeProvider>
        </Box>
        <Box
          component="main"
          sx={{ p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, overflow: 'auto', minHeight: '100%' }}
        >
          <Outlet />
        </Box>
      </Box>
      <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Footer />
      </AppBar>
    </div>
  );
}

export default InicioUser;