import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearSession,clearCookies } from '../../store/authSlice';
import { Box, AppBar, Drawer, CssBaseline, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';

import InboxIcon from '@mui/icons-material/Inbox';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from "../../assets/images/Sabah.png";
import Footer from "../pie_de_pagina/Footer"
import "./InicioAdmin.css";

const drawerWidth = 240;

function InicioAdmin() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cerrarSesion = () => {
    dispatch(clearSession());
    dispatch(clearCookies());
    navigate('/')
  };

  return (<div><CssBaseline />
    <Box sx={{ display: 'flex', height: 'calc(100vh - 50px)' }} >
      <Box sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar> <img src={logo} alt="" style={{ width: '200px' }} /></Toolbar>
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() =>navigate('/admin/inbox')} >
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary="Inbox" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => cerrarSesion()} >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
          <Toolbar />
        </Drawer>
      </Box>
      <Box component="main" sx={{ p: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, overflow: 'auto', minHeight: '100%' }}>
        <Typography paragraph>
          Mario & Sonic at the Olympic Games, conocido en Japón como Mario & Sonic at the Beijing Olympics (マリオ&ソニック AT 北京オリンピック?), es un videojuego de deportes tipo crossover desarrollado por Sega Sports R&D Department de Sega Japón. Nintendo se encargó de su distribución en el territorio nipón, mientras que Sega hizo lo mismo pero para Norteamérica, Europa y demás regiones. El juego cuenta con la licencia oficial del Comité Olímpico Internacional (COI) por medio del permiso exclusivo de International Sports Multimedia (ISM). Se trata del primer título en el que aparecen personajes de las franquicias protagonizadas por Mario y Sonic the Hedgehog. Su estreno se produjo en noviembre de 2007 para la videoconsola Wii, y en enero de 2008 para la versión portátil destinada a Nintendo DS; se lo considera el primer videojuego oficial de los Juegos Olímpicos de Pekín 2008.
          Con tal de atraer el interés de los jóvenes en las Olimpiadas, Sega adoptó el ideal del COI respecto a promover el espíritu deportivo por medio de competiciones entre sus personajes. Eventualmente, solicitaron una licencia a Nintendo para poder incorporar a Mario y a otros de sus personajes, al considerar que eso añadiría una mayor competitividad al título. Hay que añadir que, a principios de los años 1990, la mascota de Sega (Sonic the Hedgehog) era el rival de Mario en la industria. Mario & Sonic at the Olympic Games contiene 24 eventos basados en los Juegos Olímpicos, en donde el jugador puede asumir el rol de algún personaje de Nintendo o de Sega para competir contra otros jugadores.Ya en el modo de juego, el usuario debe usar el Wiimote de una manera idéntica a como se practica en la vida real el deporte que esté jugando, como por ejemplo al oscilar una pala para emular un movimiento del pádel. Para la versión DS del juego, los controladores son el estilete y los botones de la portátil. En ambos juegos, las reglas y regulaciones son dadas de acuerdo al deporte específico del que se trate.
          Londres (en inglés: London, pronunciado /ˈlʌndən/ ( escuchar)) es la capital y mayor ciudad de Inglaterra y del Reino Unido.4​5​ Situada a orillas del río Támesis, Londres es un importante asentamiento humano desde que fue fundada por los romanos con el nombre de Londinium hace casi dos milenios.6​ El núcleo antiguo de la urbe, la City de Londres, conserva básicamente su perímetro medieval de una milla cuadrada. Desde el siglo xix el nombre «Londres» también hace referencia a toda la metrópolis desarrollada alrededor de este núcleo.7​ El grueso de esta conurbación forma la región de Londres y el área administrativa del Gran Londres,8​ gobernado por el alcalde y la asamblea de Londres.Londres es una ciudad global, uno de los centros neurálgicos en el ámbito de las artes, el comercio, la educación, el entretenimiento, la moda, las finanzas, los medios de comunicación, la investigación, el turismo o el transporte.10​ Es el principal centro financiero del mundo junto con Nueva York.11​12​13​ Con un PIB de 801,66 mil millones de euros en 2017, es la economía urbana más grande del continente europeo.14​15​16​ Londres es también una capital cultural mundial,17​18​19​20​ la ciudad más visitada considerando el número de visitas internacionales21​ y tiene el mayor sistema aeroportuario del mundo según el tráfico de pasajeros.22​ Asimismo, las 43 universidades de la ciudad conforman la mayor concentración de centros de estudios superiores de toda Europa.23​ En el año 2012 Londres se convirtió en la única ciudad en albergar la celebración de tres Juegos Olímpicos de Verano.24
          En esta ciudad multirracial convive gente de un gran número de culturas que hablan más de trescientos idiomas distintos.25​ La Autoridad del Gran Londres estima que en 2015 la ciudad tiene 8,63 millones de habitantes,26​ que supone el 12,5 % del total de habitantes del Reino Unido.27​ El área urbana del Gran Londres, con 10 470 00028​ habitantes, es la segunda más grande de Europa, pero su área metropolitana, con una población estimada de entre 12 y 14 millones,29​30​ es la mayor del continente. Desde 1831 a 1925 Londres, como capital del Imperio británico, fue la ciudad más poblada del mundo.31
          res. No, señor, cuando un hombre está cansado de Londres, está cansado de la vida; en Londres está todo lo que la
          vida puede ofrecer. multirracial convive gente de un gran número de culturas que hablan más de trescientos idiomas distintos.25​ La Autoridad del Gran Londres estima que en 2015 la ciudad tiene 8,63 millones de habitantes,26​ que supone el 12,5 % del total de habitantes del Reino Unido.27​ El área urbana del Gran Londres, con 10 470 00028​ habitantes, es la segunda más grande de Europa, pero su área metropolitana, con una población estimada de entre 12 y 14 millones,29​30​ es la mayor del continente. Desde 1831 a 1925 Londres, como capital del Imperio británico, fue la ciudad más poblada del mundo.31
          res. No, señor, cuando un hombre está cansado de Londres, está cansado de la vida; en Londres está todo lo que la
          vida puede ofrecer.
        </Typography>
       
      </Box>
      
    </Box>
    
    <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Footer />
    </AppBar>
  </div>
  );
}

export default InicioAdmin;