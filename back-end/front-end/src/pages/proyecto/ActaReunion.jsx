import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import { Typography, useTheme, Box, TextField, CssBaseline, Grid } from "@mui/material";
import { Button } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { useSnackbar } from 'notistack';

export default function ActaReunion() {
  const { id } = useParams();
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [objetivos, setObjetivos] = useState("");
  const [resultados, setResultados] = useState("");
  const [tareas, setTareas] = useState("");
  const [compromisos, setCompromisos] = useState("");
  const [info, setInfo] = useState("");
  const { enqueueSnackbar } = useSnackbar();

const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };
const traerInfo = async ( id) => {
    
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerInfoActa/${id}`, { 
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` ,'id':`${id}`}
      
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message,'error');
      }
      await setInfo(data);
      generarPDF();
      
      }catch(error){
        mostrarMensaje('Error al generar el PDF', 'error');
      }
    }

const generarPDF = async () => {
 
    try {
      const data = {
        fecha: info.acta[0].fecha,
        invitados: info.acta[0].invitados,
        comrpomisos: info.acta[0].compromisos,
        objetivos: info.acta[0].descrip_obj,
        tareas: info.acta[0].tareas_ant,
        nombre: info.acta[0].nombre,  
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
      mostrarMensaje('Error al generar el PDF:','error');
    }
  }

  const guardarInfoActa = async (e) => {
    try {
      const data = {
        id_reunion: id,
        objetivos : objetivos, 
        resultados :resultados, 
        tareas : tareas, 
        compromisos: compromisos

      };
  
      const response = await fetch("http://localhost:5000/proyecto/guardarInfoActa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
  
      if (response.ok) {
        mostrarMensaje("El acta se guardo exitosamente.",'success');
      } else {
        mostrarMensaje("Ocurrió un error.",'error');
      }
      
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar el acta", 'error');
    }
  }

  return (
    <div style={{ margin: "15px" }} >
      <CssBaseline />
      <Typography
        variant="h4"
        color="secondary"
      >
        FORMATO REUNIONES REALIMENTACIÓN
      </Typography>
      <br>
      </br>

        <Box >
        <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
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
        <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
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
        <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
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
        <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
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