import React, { useState, useEffect } from "react";

import { useParams } from 'react-router-dom';
import { Typography, Box, TextField, Grid, CssBaseline, Button, Tooltip, IconButton } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import './VerProyecto.css';

import CustomDataGrid from "../../layouts/DataGrid";
import RealizarEntrega from './Ventana/RealizarEntrega';

import CambiarCodigo from './Ventana/CambiarCodigo';
import { PostAdd } from "@mui/icons-material";

import { useSnackbar } from 'notistack';
export default function VerProyectos() {
  const { id } = useParams();
  const token = useSelector(selectToken);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };
  
  const [existe, setExiste] = useState([]);
  const [proyecto, setProyecto] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [director, setDirector] = useState([]);
  const [lector, setLector] = useState([]);
  const [existeLector, setExisteLector] = useState([]);
  const [existeJurados, setExisteJurados] = useState([]);
  const [listaJurado, setListaJurado] = useState([]);

  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsRealizadas, setRowsRealizadas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const asignarCodigo = async (id, acronimo, anio, periodo) => {
    try {
      const response = await fetch("http://localhost:5000/comite/asignarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: id, acronimo: acronimo, anio: anio, periodo: periodo })
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
        setExiste(false)
      } else {
        actualizarProyecto(data.codigo, data.etapa)

        mostrarMensaje("Se ha asignado un código al proyecto", "success");
      }
    } catch (error) {
      setExiste(false)
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  }
  const modificarCodigo = async (nuevo_cod) => {
    try {
      const response = await fetch("http://localhost:5000/comite/cambiarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: id, codigo: nuevo_cod })
      });
      const data = await response.json();
      if (response.status === 400) {
        mostrarMensaje(data.message, "error")
      } else if (data.success) {
        actualizarProyecto(nuevo_cod, proyecto.etapa)
        mostrarMensaje("Se ha actualizado el código del proyecto", "success");
      } else {
        mostrarMensaje(data.message, "error")
      }
    }
    catch (error) {
      setExiste(false)
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };
  const actualizarProyecto = (nuevoCodigo, etapa) => {
    setProyecto((prevState) => ({
      ...prevState,
      codigo: nuevoCodigo
    }));
    setProyecto((prevState) => ({
      ...prevState,
      etapa: etapa
    }));
  };

  const infoProyecto = async () => {
    try {
      const response = await fetch(`http://localhost:5000/comite/verProyecto/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
        setExiste(false)
      } else {
        setProyecto(data.proyecto);
        setEstudiantes(data.estudiantes);
        setDirector(data.director);
        setExisteLector(data.lector.existe_lector)
        setLector(data.lector.existe_lector ? data.lector.nombre : "");
        setExisteJurados(data.jurados.existe_jurado)
        setListaJurado(data.jurados.existe_jurado ? data.jurados.jurados : []);
        setExiste(true)
      }
    }
    catch (error) {
      setExiste(false)
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };
  const llenarTabla = async (endpoint, proyecto_id, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/entrega/${endpoint}/${proyecto_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsFunc(data.espacios);
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  }


  useEffect(() => {
    infoProyecto()
    llenarTabla("pendientes", id, setRowsPendientes);
    llenarTabla("realizadas", id, setRowsRealizadas);
  }, [id]);

  const [open, setOpen] = useState(false);

  const abrirDialogCambiarCodigo = () => {
    setOpen(true);
  };

  const cerrarDialogCambiarCodigo = (newValue) => {
    setOpen(false);
    if (newValue) {
      modificarCodigo(newValue)
    };
  }
  const abrirDialogAgregarEntrega = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const cerrarDialogAgregarEntrega = () => {
    setOpenDialog(false);
  };

  const cerrarEntregaAgregada = () => {
    setRowsPendientes([])
    setRowsRealizadas([])
    llenarTabla("pendientes", id, setRowsPendientes);
    llenarTabla("realizadas", id, setRowsRealizadas);
    setOpenDialog(false);
  };


  const generarColumnas = (extraColumns) => {
    const columns = [
      { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150   },
      { field: 'descripcion', headerName: 'Descripción', flex: 0.3, minWidth: 150},
      { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.15, minWidth: 100,   valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.15, minWidth: 100,   valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'nombre_rol', headerName: 'Calificador', flex: 0.2, minWidth: 100 }
    ];
    return [...columns, ...extraColumns];
  };

  const columnasPendientes = generarColumnas([
    {
      field: "Acción",
      flex: 0.1,
      minWidth: 50,
      
      
      renderCell: ({ row }) => {
        return (
          <Box width="100%" ml="10px" display="flex" justifyContent="center">
            <Tooltip title="Añadir entrega">
              <IconButton color="secondary" onClick={() => abrirDialogAgregarEntrega(row)}>
                <PostAdd />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ]);

  const columnas = generarColumnas([ { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.15, minWidth: 100,   valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
]);

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
          {proyecto.etapa === "Propuesta" ? (
            <Button variant="outlined" disableElevation size="small" onClick={() => asignarCodigo(id, proyecto.acronimo, proyecto.anio, proyecto.periodo)}>
              Asignar Código
            </Button>
          ) : (
            <Button variant="outlined" disableElevation onClick={abrirDialogCambiarCodigo} sx={{
              width: 200,
          }}>
              Modificar código
            </Button>
          )}
          <CambiarCodigo
            open={open}
            onClose={cerrarDialogCambiarCodigo}
            proyectoCodigo={proyecto.codigo || ''}
          />
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

              {proyecto.acronimo !== "AUX" && proyecto.acronimo !== "COT" && (
                <>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Typography variant="h6" color="primary">Lector</Typography>
                    {existeLector ? (
                      <TextField value={lector || ''} xs={12} sm={6} md={4} lg={4} xl={3} fullWidth />
                    ) : (
                      <Typography variant="h6" color="primary">No se ha asignado lector para este proyecto</Typography>
                    )}

                  </Grid>
                </>
              )}
            </Grid>
          </Box>

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
                        Correo electrónico
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
          {proyecto.acronimo !== "AUX" && proyecto.acronimo !== "COT" && (
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
        <Typography variant="h6" color="primary">Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.</Typography>
      )}
      
      <Box mt={4}>
      <Typography variant="h1" color="secondary" fontWeight="bold">
        ENTREGAS
      </Typography>
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={rowsPendientes} columns={columnasPendientes} mensaje="No hay entregas pendientes" />
        <RealizarEntrega
          open={openDialog}
          onClose={cerrarDialogAgregarEntrega}
          onSubmit={cerrarEntregaAgregada}
          entrega={selectedRow || {}}
        />
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas realizadas
        </Typography>
        <CustomDataGrid rows={rowsRealizadas} columns={columnas} mensaje="No hay entregas realizadas" />

      </Box>
    </div>
  );
}
