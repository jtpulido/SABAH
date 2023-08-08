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
  const idUsuario = sessionStorage.getItem('user_id_usuario');
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [subMenuStates, setSubMenuStates] = useState({
    proyectos: false,
    reuniones: false,
    solicitudes: false,
    entregas: false,
  });

  const handleSubMenuClick = (button) => {
    setSubMenuStates((prevState) => ({
      ...prevState,
      [button]: !prevState[button],
    }));
  };

  const [isDirector, setIsDirector] = useState(false);
  const [isLector, setIsLector] = useState(false);
  const [isJurado, setIsJurado] = useState(false);

  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const responseDirector = await fetch('http://localhost:5000/usuario/rolDirector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: idUsuario }),
        });

        const responseLector = await fetch('http://localhost:5000/usuario/rolLector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: idUsuario }),
        });

        const responseJurado = await fetch('http://localhost:5000/usuario/rolJurado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: idUsuario }),
        });

        const dataDirector = await responseDirector.json();
        const dataLector = await responseLector.json();
        const dataJurado = await responseJurado.json();

        if (!dataDirector.success) {
          sessionStorage.setItem('estadoRolDirector', false.toString());
          setIsDirector(false);
        } else {
          sessionStorage.setItem('estadoRolDirector', true.toString());
          setIsDirector(true);
        }

        if (!dataLector.success) {
          sessionStorage.setItem('estadoRolLector', false.toString());
          setIsLector(false);
        } else {
          sessionStorage.setItem('estadoRolLector', true.toString());
          setIsLector(true);
        }

        if (!dataJurado.success) {
          setIsJurado(false);
          sessionStorage.setItem('estadoRolJurado', false.toString());
        } else {
          setIsJurado(true);
          sessionStorage.setItem('estadoRolJurado', true.toString());
        }
      } catch (error) { }
    };

    obtenerRoles();
  }, [idUsuario, token]);

  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    sessionStorage.removeItem('user_id_usuario');
    sessionStorage.removeItem('id_rol');
    navigate('/');
  };

  const [activeButton, setActiveButton] = useState('');

  const buttonColors = {
    menuInicio: activeButton === 'menuInicio' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    directorProyectos: activeButton === 'directorProyectos' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    lectorProyectos: activeButton === 'lectorProyectos' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    juradoProyectos: activeButton === 'juradoProyectos' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    directorReuniones: activeButton === 'directorReuniones' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    lectorReuniones: activeButton === 'lectorReuniones' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    juradoReuniones: activeButton === 'juradoReuniones' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    directorEntregas: activeButton === 'directorEntregas' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    lectorEntregas: activeButton === 'lectorEntregas' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    juradoEntregas: activeButton === 'juradoEntregas' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    directorSolicitudes: activeButton === 'directorSolicitudes' ? 'rgb(184, 207, 105)' : 'rgb(255, 255, 255)',
    cerrarSesion: activeButton === 'cerrarSesion' ? '#ffffff' : '#ffffff',
  };

  const handleClick = (button) => {
    if (button === 'menuInicio') {
      setActiveButton('menuInicio');
      navigate('');
    } else if (button === 'reuniones') {
      navigate('/user/reuniones');
    } else if (button === 'directorSolicitudes') {
      sessionStorage.setItem('id_rol', 1);
      navigate('/user/solicitudes');
    } else if (button === 'directorEntregas') {
      sessionStorage.setItem('id_rol', 1);
      navigate('/user/entregas');
    } else if (button === 'lectorEntregas') {
      sessionStorage.setItem('id_rol', 2);
      navigate('/user/entregas');
    } else if (button === 'juradoEntregas') {
      sessionStorage.setItem('id_rol', 3);
      navigate('/user/entregas');
    } else if (button === 'cerrarSesion') {
      cerrarSesion();
    } else if (button === 'directorProyectos') {
      sessionStorage.setItem('id_rol', 1);
      navigate('/user/proyectos');
    } else if (button === 'lectorProyectos') {
      sessionStorage.setItem('id_rol', 2);
      navigate('/user/proyectos');
    } else if (button === 'juradoProyectos') {
      sessionStorage.setItem('id_rol', 3);
      navigate('/user/proyectos');
    }
    window.location.reload();
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
        { label: 'DIRECTOR', button: 'directorSolicitudes', show: isDirector }
      ],
    },
    {
      label: 'ENTREGAS',
      button: 'entregas',
      subItems: [
        { label: 'DIRECTOR', button: 'directorEntregas', show: isDirector },
        { label: 'LECTOR', button: 'lectorEntregas', show: isLector },
        { label: 'JURADO', button: 'juradoEntregas', show: isJurado },
      ],
    },
    { label: 'CERRAR SESIÓN', button: 'cerrarSesion', action: cerrarSesion, buttonColors: '#576A3D', onClick: cerrarSesion },
  ];

  useEffect(() => {
    if (location.pathname === '/user') {
      setActiveButton('menuInicio');

    } else if (location.pathname === '/user/solicitudes') {
      if (sessionStorage.getItem('id_rol') === '1') {
        setActiveButton('directorSolicitudes');
      }

    } else if (location.pathname === '/user/proyectos') {
      if (sessionStorage.getItem('id_rol') === '1') {
        setActiveButton('directorProyectos');
      } else if (sessionStorage.getItem('id_rol') === '2') {
        setActiveButton('lectorProyectos');
      } else if (sessionStorage.getItem('id_rol') === '3') {
        setActiveButton('juradoProyectos');
      }

    } else if (location.pathname === '/user/reuniones') {
      if (sessionStorage.getItem('id_rol') === '1') {
        setActiveButton('directorReuniones');
      } else if (sessionStorage.getItem('id_rol') === '2') {
        setActiveButton('lectorReuniones');
      } else if (sessionStorage.getItem('id_rol') === '3') {
        setActiveButton('juradoReuniones');
      }
    } else if (location.pathname === '/user/entregas') {
      if (sessionStorage.getItem('id_rol') === '1') {

        setActiveButton('directorEntregas');
      } else if (sessionStorage.getItem('id_rol') === '2') {
        setActiveButton('lectorEntregas');
      } else if (sessionStorage.getItem('id_rol') === '3') {
        setActiveButton('juradoEntregas');
      }
    }

  }, [location.pathname]);

  useEffect(() => {
    const initialSubMenuStates = {
      proyectos: activeButton === 'directorProyectos' || activeButton === 'lectorProyectos' || activeButton === 'juradoProyectos',
      reuniones: activeButton === 'directorReuniones' || activeButton === 'lectorReuniones' || activeButton === 'juradoReuniones',
      entregas: activeButton === 'directorEntregas' || activeButton === 'lectorEntregas' || activeButton === 'juradoEntregas',
      solicitudes: activeButton === 'directorSolicitudes',
    };

    setSubMenuStates(initialSubMenuStates);
  }, [activeButton]);

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