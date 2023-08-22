import React, { useState, useEffect } from "react";
import { Typography, useTheme, Box, TextField, CssBaseline, Grid } from "@mui/material";
import { Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { useSnackbar } from 'notistack';


export default function ActaReunion() {

  const idReunion = sessionStorage.getItem('proyecto_id_reunion');
  const estadoActa = sessionStorage.getItem('estado_acta');
  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);

  const navigate = useNavigate();

  const [objetivos, setObjetivos] = useState("");
  const [resultados, setResultados] = useState("");
  const [tareas, setTareas] = useState("");
  const [compromisos, setCompromisos] = useState("");
  const [info, setInfo] = useState("");

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const traerInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerInfoActa/${idReunion}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });

      const data = await response.json();
      if (data.success) {
        setInfo(data.acta);
        setObjetivos(data.acta.descrip_obj);
        setResultados(data.acta.resultados_reu);
        setTareas(data.acta.tareas_ant);
        setCompromisos(data.acta.compromisos);
      }

    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  useEffect(() => {
    if (estadoActa === 'descargar') {
      traerInfo();
    }
  }, [estadoActa, idReunion]);

  const generarPDF = async () => {
    try {
      const infoproyecto = await fetch(`http://localhost:5000/proyecto/obtenerProyecto/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      const data_proyecto = await infoproyecto.json();
      const infoinvitados = await fetch(`http://localhost:5000/proyecto/obtenerInvitados/${idReunion}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      const data_invitados = await infoinvitados.json();
      const data = {
        fecha: info.fecha,
        compromisos: compromisos,
        objetivos: objetivos,
        tareas: tareas,
        nombre: info.nombre,
        resultados: resultados,
        data_proyecto,
        data_invitados
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
      navigate('/proyecto/Reuniones');

    } catch (error) {
      mostrarMensaje("Ha ocurrido un error al generar el PDF. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  const guardarInfoActa = async (e) => {
    try {
      const infoActa = {
        id_reunion: idReunion,
        objetivos: objetivos,
        resultados: resultados,
        tareas: tareas,
        compromisos: compromisos
      };

      const response = await fetch("http://localhost:5000/proyecto/guardarInfoActa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(infoActa),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });

      const data = await response.json();
      if (data.success) {
        mostrarMensaje(data.message, 'success');
        navigate('/proyecto/Reuniones');
      } else {
        mostrarMensaje(data.message, 'error');
      }

    } catch (error) {
      mostrarMensaje("Ha ocurrido un error al guardar la información del acta. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  return (
    <div style={{ margin: "15px" }} >
      <CssBaseline />
      <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
        FORMATO REUNIONES REALIMENTACIÓN
      </Typography>
      <br>
      </br>

      <Box >
        <Typography variant="h5" color="secondary" sx={{ mt: "30px", mb: "8px" }}>
          Descripción de Objetivos
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                required
                rows={3}
                multiline
                value={objetivos}
                onChange={(e) => setObjetivos(e.target.value)}
                fullWidth
                error={!objetivos}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box >
        <Typography variant="h5" color="secondary" sx={{ mt: "30px", mb: "8px" }}>
          Resultados de Reunión
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                required
                rows={3}
                multiline
                value={resultados}
                onChange={(e) => setResultados(e.target.value)}
                fullWidth
                error={!resultados}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box >
        <Typography variant="h5" color="secondary" sx={{ mt: "30px", mb: "8px" }}>
          Tareas Sesión Anterior
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                required
                rows={3}
                multiline
                value={tareas}
                onChange={(e) => setTareas(e.target.value)}
                fullWidth
                error={!tareas}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box >
        <Typography variant="h5" color="secondary" sx={{ mt: "30px", mb: "8px" }}>
          Compromisos
        </Typography>
        <Box >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                required
                rows={3}
                multiline
                value={compromisos}
                onChange={(e) => setCompromisos(e.target.value)}
                fullWidth
                error={!compromisos}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {estadoActa === 'crear' && (
        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained" onClick={() => guardarInfoActa()}>Guardar Acta</Button>  </Box>
      )}
      {estadoActa === 'descargar' && (
        <Box style={{ marginTop: '30px' }}>
          <Button variant="contained" onClick={() => generarPDF()}>Descargar PDF</Button>  </Box>
      )}
    </div>

  );
}