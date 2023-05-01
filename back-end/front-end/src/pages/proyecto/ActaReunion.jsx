import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Typography, useTheme, Alert, Snackbar, Box, TextField, CssBaseline, TableContainer, TableHead, TableRow, TableCell, TableBody, Grid } from "@mui/material";
import "./InicioPro.css";
import { Button } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";

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
          Información General * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="h6" color={colors.primary[100]}>
                Fecha *
              </Typography>
              <TextField fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="h6" color={colors.primary[100]}>
                Hora *
              </Typography>
              <TextField fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>
      <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Descripción de Objetivos * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box> 
      <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Tareas Sesion Anterior * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>
      <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Programar Próxima Reunión * 
        </Typography>
        <Box >
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="h6" color={colors.primary[100]}>
                Fecha *
              </Typography>
              <TextField fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="h6" color={colors.primary[100]}>
                Hora *
              </Typography>
              <TextField fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>
        <Button type="submit"> Enviar </Button>
    </div>
  );
}