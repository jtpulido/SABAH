import React, { useState, useEffect } from "react";
import { Typography, useTheme, Box, TextField, Grid, CssBaseline } from "@mui/material";
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import './VerProyecto.css';
import { useSnackbar } from 'notistack';

export default function VerProyectos() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [existe, setExiste] = useState([]);
  const [proyecto, setProyecto] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [director, setDirector] = useState([]);
  const [lector, setLector] = useState([]);
  const [existeLector, setExisteLector] = useState([]);
  const [existeJurados, setExisteJurados] = useState([]);
  const [listaJurado, setListaJurado] = useState([]);
  const [existeCliente, setExisteCliente] = useState([]);
  const [listaCliente, setListaCliente] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
      enqueueSnackbar(mensaje, { variant: variante });
    };

  const infoProyecto = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/proyecto/obtenerProyecto/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message,'error');
        setExiste(false)
      } else {
        setProyecto(data.proyecto);
        setEstudiantes(data.estudiantes);
        setDirector(data.director);
        setExisteLector(data.lector.existe_lector)
        setLector(data.lector.existe_lector ? data.lector.nombre : "");
        setExisteJurados(data.jurados.existe_jurado)
        setListaJurado(data.jurados.existe_jurado ? data.jurados.jurados : []);
        setExisteCliente(data.cliente.existe_cliente)
        setListaCliente(data.cliente.existe_cliente ? data.cliente : []);
        setExiste(true)
      }
    }
    catch (error) {
     
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.",'error');
    }
  };
  useEffect(() => {
    infoProyecto()
  }, []);
  return (
    <div style={{ margin: "15px" }} >
      
      {existe ? (

        <Box sx={{ '& button': { mt: 1 } }}>
          <CssBaseline />

          <Typography
            variant="h4"
            color="secondary"
          >
            {proyecto.modalidad || ''}
          </Typography>
          <Typography
            variant="h5"
          >
            {proyecto.nombre || ''}
          </Typography>
          <Typography
            variant="h5"
          >
            {proyecto.codigo || ''}
          </Typography>
          
          <Box >
            <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
              Información General
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" color="primary">
                  Modalidad
                </Typography>
                <TextField value={proyecto.modalidad || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" color="primary">
                  Etapa
                </Typography>
                <TextField value={proyecto.etapa || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" color="primary">
                  Estado
                </Typography>
                <TextField value={proyecto.estado || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" color="primary">
                  Año
                </Typography>
                <TextField value={proyecto.anio || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" color="primary">
                  Período
                </Typography>
                <TextField value={proyecto.periodo || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" color="primary">
                  Director
                </Typography>
                <TextField value={director.nombre || ''} fullWidth />
              </Grid>

              {proyecto.acronimo !== "AUX" && (
                <>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography variant="h6" color="primary">Lector</Typography>
                    {existeLector ? (
                      <TextField value={lector || ''} xs={12} sm={6} md={4} lg={4} xl={3} fullWidth />
                    ) : (
                      <Typography variant="h6" color="primary">No se han asignado lector</Typography>
                    )}

                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          {proyecto.acronimo == "DT" && (
            <> <Box>

              <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
                Cliente
              </Typography>
              {existeCliente ? (
                <Grid container spacing={2}>
                  <Grid item  sm={6} md={4} lg={4} xl={3}>
                    <Typography variant="h6" color="primary">
                    Nombre Cliente
                    </Typography>
                    <TextField
                      value={listaCliente.empresa || ''}
                      fullWidth
                    />
                    </Grid>
                    <Grid item  sm={6} md={4} lg={4} xl={3}>
                    <Typography variant="h6" color="primary">
                      Representante Cliente
                    </Typography>
                    <TextField
                      value={listaCliente.representante || ''}
                      fullWidth
                    />
                    </Grid>
                    <Grid item   sm={6} md={4} lg={4} xl={3}>
                    <Typography variant="h6" color="primary">
                      Correo Representante
                    </Typography>
                    <TextField
                      value={listaCliente.correo || ''}
                      fullWidth
                    />
                    </Grid>
                   </Grid>

              ) : (<Typography variant="h6" color="primary">No se han asignado cliente</Typography>
              )}
            </Box>
            </>
          )}
        
          <Box>
            <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
              Estudiante(s)
            </Typography>

            <Grid container>
              {estudiantes.map((estudiante) => (
                <Grid item key={estudiante.num_identificacion} xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                      <Typography variant="h6" color="primary">
                        Nombre
                      </Typography>
                      <TextField
                        value={estudiante.nombre || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                      <Typography variant="h6" color="primary">
                        Correo
                      </Typography>
                      <TextField
                        value={estudiante.correo || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
                      <Typography variant="h6" color="primary">
                        Número de Identificación
                      </Typography>
                      <TextField
                        value={estudiante.num_identificacion || ''}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Box>
          {proyecto.acronimo !== "AUX" && (
            <> <Box>

              <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
                Jurado(s)
              </Typography>
              {existeJurados ? (


                <Grid container spacing={2}>
                  {listaJurado.map((jurado) => (
                    <Grid item key={jurado.id} xs={12} sm={6} md={6} lg={6} xl={6}>
                      <Typography variant="h6" color="primary">
                        Nombre
                      </Typography>
                      <TextField
                        value={jurado.nombre || ''}
                        fullWidth
                      />
                    </Grid>
                  ))}
                </Grid>

              ) : (<Typography variant="h6" color="primary">No se han asignado jurados</Typography>
              )}
            </Box>
            </>
          )}
        </Box>
      ) : (
        <Typography variant="h6" color="primary"></Typography>
      )}
    </div>
  );
}