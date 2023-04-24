import React, { useState, useEffect } from "react";

import { useParams } from 'react-router-dom';
import { Typography, useTheme, Alert, Snackbar, Box, TextField, Grid, CssBaseline } from "@mui/material";
import "./Proyectos.css";
import { tokens } from "../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import './VerProyecto.css';
export default function VerProyectos() {
  const { id } = useParams();
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const [proyecto, setProyecto] = useState([]);
  const infoProyecto = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/verProyecto", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: id })
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setProyecto(data.proyecto);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  useEffect(() => {
    infoProyecto()
  }, []);
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
        {proyecto.modalidad}
      </Typography>
      <Typography
        variant="h5"
      >
        {proyecto.nombre}
      </Typography>
      <Typography
        variant="h5"
      >
        {proyecto.codigo}
      </Typography>
      <Box >
        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
          Información General
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="h6" color={colors.primary[100]}>
              Modalidad
            </Typography>
            <TextField value={proyecto.modalidad} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="h6" color={colors.primary[100]}>
              Etapa
            </Typography>
            <TextField value={proyecto.etapa} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="h6" color={colors.primary[100]}>
              Estado
            </Typography>
            <TextField value={proyecto.estado} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="h6" color={colors.primary[100]}>
              Año
            </Typography>
            <TextField value={proyecto.anio} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="h6" color={colors.primary[100]}>
              Período
            </Typography>
            <TextField value={proyecto.periodo} fullWidth />
          </Grid>

        </Grid>
      </Box>
    </div>
  );
}