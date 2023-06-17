import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Typography, useTheme, Alert, Snackbar, Box, TextField, CssBaseline, TableContainer, TableHead, TableRow, TableCell, TableBody, Grid } from "@mui/material";
import "./InicioPro.css";
import { Button } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
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
        FORMATO REUNIONES REALIMENTACIÓN
      </Typography>
      <br>
      </br>

        <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Descripción de Objetivos * 
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
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Resultados de Reunión * 
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
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Tareas Sesión Anterior * 
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
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Compromisos * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
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