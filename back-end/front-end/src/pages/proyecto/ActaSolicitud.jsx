import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import { Typography, Alert, Snackbar, Box, TextField, CssBaseline, Grid } from "@mui/material";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { useSnackbar } from 'notistack';
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

export default function ActaReunion() {
  const { id } = useParams();
  const token = useSelector(selectToken);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  const options = [
    "Cambio de objetivos",
    "Cambio de título",
    "Retiro de integrantes",
    "Consideración fecha extemporánea",
    "Cancelación de proyecto",
    "Extensión de tiempo",
    "Nuevo integrante",
    "Otros",
    "Enviar solicitud de aval"
  ];
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };
  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  }

  return (
    <div style={{ margin: "15px" }} >
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <CssBaseline />
      <Typography
        variant="h4"
        color="secondary"
      >
        FORMATO SOLICITUDES
      </Typography>
      <br>
      </br>

        <Box >
        <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
          Información general * 
        </Typography> 
        </Box>

      <Box>
      <Typography variant="h6" color="primary" sx={{ mt: "20px", mb: "20px" }}>
          Tipo Solicitud * 
        </Typography>
      <Box >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Seleccione una opción</InputLabel>
              <Select
                value={selectedOption}
                onChange={handleChange}
              >
                {options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
          </Box> 
      </Box>
      <Box >
        <Typography variant="h6" color="primary" sx={{ mt: "20px", mb: "20px" }}>
          Justificación * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box> 
      <Box >
        <Typography variant="h6" color="primary" sx={{ mt: "20px", mb: "20px" }}>
          Link Documento De Soporte * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={6} >
              <TextField fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>

        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained" color="secondary" >Enviar</Button>  </Box>
        
      </div>

  );
}