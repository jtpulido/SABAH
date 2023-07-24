import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { TextField, Grid } from '@mui/material';
import { Typography, useTheme} from "@mui/material";
import "./InicioPro.css";
import {  Button, IconButton, Tooltip } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import CreateIcon from '@mui/icons-material/Create';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Dialog, DialogContent, DialogActions } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useSnackbar } from 'notistack';

export default function VerReunion() {
  const location = useLocation();
  const token = useSelector(selectToken);
  const theme = useTheme();
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [enlace, setEnlace] = useState("");
  const [idReunion, setIdReunion] = useState("");
  const colors = tokens(theme.palette.mode);
  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const decodedNombre = decodeURIComponent(queryParams.get("nombre"));
    const decodedFecha = decodeURIComponent(queryParams.get("fecha"));
    const decodedHora = decodeURIComponent(queryParams.get("hora"));
    const decodedEnlace = decodeURIComponent(queryParams.get("enlace"));
    const decodedIdReunion = decodeURIComponent(queryParams.get("idReunion"));

    setNombre(decodedNombre);
    setFecha(decodedFecha);
    setHora(decodedHora);
    setEnlace(decodedEnlace);
    setIdReunion(decodedIdReunion);

  }, [location.search]);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
       <Typography variant="h1" color="secondary" > VER REUNIÓN </Typography>
       <IconButton color="secondary" style={{ marginLeft: '20px' }} aria-label="delete" size="large" >
            <CreateIcon />
          </IconButton>
       <Tooltip title="Cancelar">
           <IconButton color="secondary" style={{ marginLeft: '10px' }}
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas cancelar la reunión?')) {
                 
                  fetch('http://localhost:5000/proyecto/cancelarReunion', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ id: idReunion })
                   
                  })
                  
                    .then(response => {
                      if (response.ok) {
                        alert('La reunión se canceló correctamente','success');
                      } else {
                        
                        alert('Ocurrió un error al cancelar la reunión','error');
                      }
                    })
                    .catch(error => {
                      mostrarMensaje('Ocurrió un error al cancelar la reunión','error');
                    });
                }
              }}>
                <HighlightOffIcon />
              </IconButton >
          </Tooltip>
          <Dialog >
          <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} >
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Fecha"
                      value={fecha}
                      onChange={(newValue) => setFecha(newValue)}
                      renderInput={(props) => <input {...props} />} 
                    />
                  </LocalizationProvider>
                </Grid>
              
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Enlace Reunión"
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Invitado</InputLabel>
                    <Select
                      
                    >
                      <MenuItem value="cliente">Cliente</MenuItem>
                      <MenuItem value="director">Director</MenuItem>
                      <MenuItem value="lector">Lector</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center" }}>
              <Button variant="contained" color="primary" sx={{ fontSize: "0.6rem" }}>
                Guardar
              </Button>
            </DialogActions>
            </Dialog>
    </div>
  );
}
