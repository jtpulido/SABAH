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
  const [objetivos, setObjetivos] = useState("");
  const [resultados, setResultados] = useState("");
  const [tareas, setTareas] = useState("");
  const [compromisos, setCompromisos] = useState("");
  const [info, setInfo] = useState("");
  

const traerInfo = async ( id) => {
    console.log("hhhh",id)
    try {
      // Llama a tu API para generar el PDF en el backend
      const response = await fetch(`http://localhost:5000/proyecto/obtenerInfoActa/${id}`, { 
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` ,'id':`${id}`}
      
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      }
      await setInfo(data);
      generarPDF();
      
      }catch(error){
        console.log(error);
        console.error('Error al generar el PDF:', error);
      }
    }

const generarPDF = async () => {
  console.log(info)
    try {
      const data = {
        fecha: info.acta[0].fecha,
        invitados: info.acta[0].invitados,
        comrpomisos: info.acta[0].compromisos,
        objetivos: info.acta[0].descrip_obj,
        tareas: info.acta[0].tareas_ant,
        nombre: info.acta[0].nombre,  // Convertir a número entero
      };
      const response = await fetch('http://localhost:5000/proyecto/generarPDF', { 
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const { outputPath } = await response.json();
      const downloadLink = document.createElement('a');
      downloadLink.href = outputPath;
      downloadLink.download = 'mi-archivo.pdf';
      downloadLink.click();
    } catch (error) {
      console.log(error);
      console.error('Error al generar el PDF:', error);
    }
  }

  const guardarInfoActa = async (e) => {
    try {
      // Crea un objeto con los datos que deseas enviar al backend
      const data = {
        id_reunion: id,
        objetivos : objetivos, 
        resultados :resultados, 
        tareas : tareas, 
        compromisos: compromisos

      };
  
      // Realiza la solicitud POST al backend
      const response = await fetch("http://localhost:5000/proyecto/guardarInfoActa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
  
      // Verifica si la solicitud fue exitosa
      if (response.ok) {
        console.log("El acta se guardo exitosamente.");
      } else {
        console.error("Ocurrió un error.");
      }
      
    } catch (error) {
      console.error("Ocurrió un error al realizar el acta :", error);
    }
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
              <TextField 
              label="objetivos"
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
              fullWidth />
              
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
              <TextField 
              label="resultados"
              value={resultados}
              onChange={(e) => setResultados(e.target.value)}
              fullWidth />
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
              <TextField 
              label="tareas"
              value={tareas}
              onChange={(e) => setTareas(e.target.value)}
              fullWidth />
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
              <TextField 
              label="compromisos"
              value={compromisos}
              onChange={(e) => setCompromisos(e.target.value)}
              fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>
        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained" color="secondary" onClick={() => guardarInfoActa()}>Guardar</Button>  </Box>
        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained" color="secondary" onClick={() => traerInfo(id)}>Enviar</Button>  </Box>
        
      </div>

  );
}