import React, { useState, useEffect } from "react";

import {  useParams } from 'react-router-dom';
import { Typography, useTheme, Alert, Snackbar } from "@mui/material";
import "./Proyectos.css";
import { tokens } from "../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";

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
      const response = await fetch("http://localhost:5000/proyectos/verProyecto", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(id)
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
      <Typography
        variant="h1"
        color={colors.secundary[100]}
        fontWeight="bold"
      >
        PROYECTOS {id}
      </Typography>


    </div>
  );
}