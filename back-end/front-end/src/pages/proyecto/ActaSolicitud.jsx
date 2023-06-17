import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Typography, useTheme, Alert, Snackbar, Box, TextField, CssBaseline, TableContainer, TableHead, TableRow, TableCell, TableBody, Grid } from "@mui/material";
import "./InicioPro.css";
import { Button } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


export default function ActaReunion() {
  const { id } = useParams();
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
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
        color={colors.secundary[100]}
      >
        FORMATO SOLICITUDES
      </Typography>
      <br>
      </br>

        <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Información general * 
        </Typography> 
        </Box>

      <Box>
      <Typography variant="h6" color={colors.primary[100]} sx={{ mt: "20px", mb: "20px" }}>
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
        <Typography variant="h6" color={colors.primary[100]} sx={{ mt: "20px", mb: "20px" }}>
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
        <Typography variant="h6" color={colors.primary[100]} sx={{ mt: "20px", mb: "20px" }}>
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