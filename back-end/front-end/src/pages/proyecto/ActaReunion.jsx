import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Typography, useTheme, Box, TextField, CssBaseline, Grid } from "@mui/material";
import { Button } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';


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
  const [existe,setExiste] = useState("");

const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

const traerInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerInfoActa/${id}`, { 
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` ,'id':`${id}`}
      
      });
      const data = await response.json();

      if (!data.success) {
        setExiste(false)
      }else {
        setExiste(true)
        setInfo(data);
        setObjetivos(data.acta[0].descrip_obj);
        setResultados(data.acta[0].resultados_reu);
        setTareas(data.acta[0].tareas_ant);
        setCompromisos(data.acta[0].compromisos);
      }
      
      
      
      }catch(error){
        mostrarMensaje('Error', 'error');
      }
    }
  
useEffect(() => {
      traerInfo();

    },[id] );
  
const generarPDF = async () => {
      try {
        const data = {
          fecha: info.acta[0].fecha,
          invitados: info.acta[0].invitados,
          compromisos: info.acta[0].compromisos,
          objetivos: info.acta[0].descrip_obj,
          tareas: info.acta[0].tareas_ant,
          nombre: info.acta[0].nombre,
        };
        const response = await fetch('http://localhost:5000/proyecto/generarPDF', {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
        });
    
        const blob = await response.blob();
        const fileName = `${data.nombre}.pdf`;
        const url = URL.createObjectURL(blob);
    
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
    
        downloadLink.click();
    
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      } catch (error) {
        mostrarMensaje('Error al generar el PDF:', 'error');
      }
    };
    
    
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
      >
        FORMATO REUNIONES REALIMENTACIÓN
      </Typography>
      <br>
      </br>

        <Box >
        <Typography variant="h6" sx={{ mt: "20px", mb: "20px" }}>
          Descripción de Objetivos * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField 
              label="objetivos"
              value={objetivos}
              fullWidth
              onChange={(e) => {
                if (!existe) {
                  setObjetivos(e.target.value);
                }
              }}     
              />     
            </Grid>
          </Grid>
          </Box>  
        </Box>
      <Box >
        <Typography variant="h6" sx={{ mt: "20px", mb: "20px" }}>
          Resultados de Reunión * 
        </Typography>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField 
              label="resultados"
              value={resultados}
              onChange={(e) => {
                if (!existe) {
                  setResultados(e.target.value);
                }
              }}                 
              fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box> 
      <Box >
        <Typography variant="h6"  sx={{ mt: "20px", mb: "20px" }}>
          Tareas Sesión Anterior * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField 
              label="tareas"
              value={tareas}
              onChange={(e) => {
                if (!existe) {
                  setTareas(e.target.value);
                }
              }}   
              fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>
      <Box >
        <Typography variant="h6" sx={{ mt: "20px", mb: "20px" }}>
          Compromisos * 
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField 
              label="compromisos"
              value={compromisos}
              onChange={(e) => {
                if (!existe) {
                  setCompromisos(e.target.value);
                }
              }}   
              fullWidth />
            </Grid>
          </Grid>
          </Box>  
        </Box>
        {!existe && (
        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained" onClick={() => guardarInfoActa()} component={Link} to={`/proyecto/Reuniones`}>Guardar</Button>  </Box>
        )}
        {existe && (
        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained"  onClick={() => generarPDF()} component={Link} to={`/proyecto/Reuniones`}>PDF</Button>  </Box>
         )}
      </div>

  );
}