import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession} from '../../store/authSlice';
import { Box, AppBar, Drawer, CssBaseline, List, ListItem, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer"
import { Outlet } from 'react-router-dom';
const drawerWidth = 240;

function InicioPro() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cerrarSesion = () => {
    dispatch(clearSession());
    navigate('/')
  };

  const [activeButton, setActiveButton] = useState(null);
  const buttonColors = {
    proyecto: activeButton === "proyecto" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    entregas: activeButton === "entregas" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    reuniones: activeButton === "reuniones" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
    solcitudes: activeButton === "solicitudes" ? "rgb(184, 207, 105)" : "rgb(255, 255, 255)",
  };

  const handleClick = (button) => {
    setActiveButton(button);
    if (button === "proyecto") {
      navigate('/proyecto')
    } else if (button === "entregas") {
      navigate('/proyecto/Entregas')
    } else if (button === "reuniones") {
      navigate('/proyecto/Reuniones')
    } else if ( button === "solicitudes"){
      navigate('/proyecto/Solicitudes')
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
                    <ListItemText primary="PROYECTO" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("entregas")} sx={{
                    backgroundColor: buttonColors.entregas,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="ENTREGAS" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("reuniones")} sx={{
                    backgroundColor: buttonColors.reuniones,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="REUNIONES" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleClick("solicitudes")} sx={{
                    backgroundColor: buttonColors.solcitudes,
                    "&:hover": {
                      backgroundColor: "rgb(184, 207, 105)",
                    },
                  }}>
                    <ListItemText primary="SOLICITUDES" sx={{ color: '#576A3D' }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
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

export default InicioPro;