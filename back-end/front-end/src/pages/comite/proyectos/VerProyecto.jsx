import React, { useState, useEffect, Fragment } from "react";
import { Typography, Box, TextField, Grid, CssBaseline, Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import './VerProyecto.css';
import VerEntrega from "../entregas/Ventanas/VerEntrega";
import CustomDataGrid from "../../layouts/DataGrid";
import CambiarCodigo from './Ventana/CambiarCodigo';
import CambiarNombre from './Ventana/CambiarNombre';
import { Add, Edit, EventAvailable, Person, Remove, Source } from "@mui/icons-material";

import { useSnackbar } from 'notistack';
import AgregarEstudiante from "./Ventana/AgregarEstudiante";
import VerModificarUsuario from "../usuarios_normales/Ventana/VerModificarUsuario";
import CambiarFecha from "./Ventana/CambiarFecha";

export default function VerProyectos() {

  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const [existe, setExiste] = useState([]);
  const [proyecto, setProyecto] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [director, setDirector] = useState({});
  const [lector, setLector] = useState({});
  const [existeLector, setExisteLector] = useState(false);
  const [existeJurados, setExisteJurados] = useState(false);
  const [listaJurado, setListaJurado] = useState([]);
  const [entregasPendientes, setEntregasPendientes] = useState([]);
  const [entregasCalificadas, setEntregasCalificadas] = useState([]);
  const [entregasPorCalificar, setEntregasPorCalificar] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [entrega, setEntrega] = useState({});
  const [tipo, setTipo] = useState("");
  const [estudiante, setEstudiante] = useState({});
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [abrirAgregarEstudiante, setAbrirAgregarEstudiante] = useState(false);
  const [open, setOpen] = useState(false);
  const [openNombre, setOpenNombre] = useState(false);
  const [openFechaGrado, setOpenFechaGrado] = useState(false);
  const [rol, setRol] = useState("");
  const [info, setInfo] = useState({});
  const [accion, setAccion] = useState("");
  const [abrirVerModificarUsuario, setAbrirVerModificarUsuario] = useState(false);


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
        actualizarProyecto(data.codigo)
        mostrarMensaje("Se ha asignado un código al proyecto", "success");
      }
    } catch (error) {
      setExiste(false)
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  }

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
        setLector(data.lector.lector);
        setExisteJurados(data.jurados.existe_jurado)
        setListaJurado(data.jurados.existe_jurado ? data.jurados.jurados : []);
        setExiste(true)
      }
    }
    catch (error) {
      setExiste(false)
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  };
  const llenarTabla = async (endpoint, proyecto_id, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/entregasProyecto/${endpoint}/${proyecto_id}`, {
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
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  }

  const quitarEstudiante = async (estudiante) => {
    setConfirmarEliminacion(false);
    try {
      const response = await fetch(`http://localhost:5000/comite/estudiante/${estudiante.id_estudiante_proyecto}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 200) {
        mostrarMensaje(data.message, "success")
        setEstudiantes(data.estudiantes)
      }
    } catch (error) {
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  }


  const actualizarProyecto = (nuevoCodigo) => {
    setProyecto((prevState) => ({
      ...prevState,
      codigo: nuevoCodigo
    }));
  };
  const actualizarNombreProyecto = (nuevoNombre) => {
    setProyecto((prevState) => ({
      ...prevState,
      nombre: nuevoNombre
    }));
  };
  const abrirConfirmarEliminacion = (estudiante) => {
    setEstudiante(estudiante);
    setConfirmarEliminacion(true);
  };
  const handleClose = () => {
    setEstudiante({})
    setConfirmarEliminacion(false);
  };

  const abrirDialogCambiarCodigo = () => {
    setOpen(true);
  };
  const cerrarDialogCambiarCodigo = async () => {
    setOpen(false);
  }
  const cerrarDialogCodigoCambiado = async ( newValue) => {
    setOpen(false);
    if (newValue) {
      actualizarProyecto(newValue)
    };
  }
  const abrirDialogCambiarNombre = () => {
    setOpenNombre(true);
  };
  const cerrarDialogCambiarNombre = () => {
    setOpenNombre(false);
  }

  const cerrarDialogNombreCambiado = (newValue) => {
    setOpenNombre(false);
    if (newValue) {
      actualizarNombreProyecto(newValue)
    };
  }
  const abrirVentanaAgregarEstudiante = () => {
    setAbrirAgregarEstudiante(true);
  };
  const cerrarDialogEstudiante = () => {
    setAbrirAgregarEstudiante(false);
  }
  const cerrarDialogAgregarEstudiante = async ( estudiantes) => {
    setAbrirAgregarEstudiante(false);
    if (estudiantes) {
      setEstudiantes(estudiantes)
    };
    setEstudiante({})
  }
  const abrirDialogCambiarFechaGrado = (estudiante) => {
    setEstudiante(estudiante)
    setOpenFechaGrado(true);
  };

  const cerrarDialogCambiarFechaGrado = () => {
    setEstudiante({})
    setOpenFechaGrado(false);
  }
  const cerrarDialogFechaGradoCambiada = (newValue) => {
    setOpenFechaGrado(false);
    if (newValue) {
      setEstudiantes(newValue)
    };
  }
  const abrirVentanaVerEntrega = (row, tipo) => {
    setEntrega(row);
    setTipo(tipo)
    setOpenDialog(true);
  };

  const generacerrarDialogVerEntrega = () => {
    setOpenDialog(false);
  };

  const abrirDialog = (row, accion, rol) => {
    if (accion === "asignar") {
      const infoRol = {
        id_proyecto: row.id,
      };
      setInfo(infoRol)
    } else if (accion === "modificar") {
      const infoRol = {
        id_proyecto: row.id_proyecto,
        id_usuario: row.id_usuario
      };
      setInfo(infoRol)
    }
    setRol(rol)
    setAccion(accion)
    setAbrirVerModificarUsuario(true);
  };

  const cerrarDialog = () => {
    setAbrirVerModificarUsuario(false);
  }
  const cerrarUsuarioCambiado = (usuarios) => {
    if (usuarios) {
      if (rol === "DIRECTOR") {
        if (usuarios.length === 1) {
          setDirector(usuarios[0])
        }
      } else if (rol === "LECTOR") {
        if (usuarios.length > 0) {
          setLector(usuarios[0])
          setExisteLector(true)
        } else {
          setLector({})
          setExisteLector(false)
        }
      } else if (rol === "JURADO") {
        if (usuarios.length > 0) {
          setListaJurado(usuarios)
          setExisteJurados(true)
        } else {
          setListaJurado({})
          setExisteJurados(false)
        }
      }

    }
    setAbrirVerModificarUsuario(false);
  }
  useEffect(() => {
    infoProyecto()
    llenarTabla("pendientes", id, setEntregasPendientes);
    llenarTabla("realizadas/calificadas", id, setEntregasCalificadas);
    llenarTabla("realizadas/porCalificar", id, setEntregasPorCalificar);
  }, [id]);

  const generarColumnasEntregas = (inicio, extraColumns) => {
    const columns = [
      { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.2, minWidth: 300 },
      { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 200 },
      { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100 }
    ]
    return [...inicio, ...columns, ...extraColumns];
  };
  const columnaPendientes = generarColumnasEntregas([{
    field: "ver",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Ver Entrega">
            <IconButton color="secondary" onClick={() => abrirVentanaVerEntrega(row, "pendiente")}>
              <Source />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  }], [
    { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },

  ]);
  const columnaPorCalificar = generarColumnasEntregas([
    {
      field: "calificar",
      headerName: "",
      flex: 0.1,
      minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Tooltip title="Calificar">
              <IconButton color="secondary" onClick={() => abrirVentanaVerEntrega(row, "")}>
                <Source />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }], [
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
    { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },

  ]);
  const columnaCalificadas = generarColumnasEntregas([{
    field: "calificado",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Calificar">
            <IconButton color="secondary" onClick={() => abrirVentanaVerEntrega(row, "calificado")}>
              <Source />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  }], [
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_evaluacion', headerName: 'Fecha de evaluación', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'nota_final', headerName: 'Nota', flex: 0.1, minWidth: 100 },

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
          {proyecto && proyecto.codigo && proyecto.codigo.startsWith("TEM") ? (
            <Button variant="outlined" disableElevation size="small" onClick={() => asignarCodigo(id, proyecto.acronimo, proyecto.anio, proyecto.periodo)} sx={{
              width: 200,
            }}>
              Asignar Código
            </Button>
          ) : (
            <Button variant="outlined" disableElevation size="small" onClick={abrirDialogCambiarCodigo} sx={{
              width: 200,
            }}>
              Modificar código
            </Button>
          )}

          <Button variant="outlined" disableElevation size="small" onClick={abrirDialogCambiarNombre} sx={{ width: 200, ml: 1 }}>
            Modificar nombre
          </Button>
          <CambiarCodigo
            open={open}
            onClose={cerrarDialogCambiarCodigo}
            onSubmit={cerrarDialogCodigoCambiado}
            proyectoCodigo={proyecto.codigo || ''}
          />
          <CambiarNombre
            open={openNombre}
            onClose={cerrarDialogCambiarNombre}
            onSubmit={cerrarDialogNombreCambiado}
            proyectoNombre={proyecto.nombre || ''}
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
                <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                  {director ? (
                    <>
                      <Box sx={{ mr: "20px", flexGrow: 1, maxWidth: '90%' }}>
                        <Typography variant="h6" color="primary" >
                          Director
                        </Typography>
                        <TextField value={director.nombre || ''} fullWidth />
                      </Box>
                      <Tooltip title="Ver/Cambiar Director">
                        <IconButton color="secondary" onClick={() => abrirDialog(director, "modificar", "DIRECTOR")}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexGrow: 1,
                    }}>
                      <Typography variant="h6" color="primary">
                        Asignar Director
                      </Typography>
                      <Tooltip title="Asignar Director">
                        <IconButton color="secondary" onClick={() => abrirDialog(proyecto, 'asignar', 'DIRECTOR')}>
                          <Person />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Grid>

              {proyecto.acronimo !== "AUX" && (
                <>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                      {existeLector ? (
                        <>
                          <Box sx={{ mr: "20px", flexGrow: 1, maxWidth: '90%' }}>
                            <Typography variant="h6" color="primary">
                              Lector
                            </Typography>
                            <TextField value={lector.nombre || ''} fullWidth />
                          </Box>
                          <Tooltip title="Ver/Cambiar Lector">
                            <IconButton color="secondary" onClick={() => abrirDialog(lector, "modificar", "LECTOR")}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexGrow: 1,
                        }}>
                          <Typography variant="h6" color="primary">
                            Asignar Lector
                          </Typography>
                          <Tooltip title="Asignar Lector">
                            <IconButton color="secondary" onClick={() => abrirDialog(proyecto, 'asignar', 'LECTOR')}>
                              <Person />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          <Box>
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
              <Typography variant="h4" color="secondary" sx={{ mt: "20px", mb: "20px", flexGrow: 1, maxWidth: '98%' }}>
                Estudiante(s)
              </Typography>
              <Tooltip title="Agregar Estudiante">
                <IconButton variant="outlined" color='secondary' size="large" onClick={abrirVentanaAgregarEstudiante} sx={{ marginLeft: '8px' }}>
                  <Add fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
            <AgregarEstudiante
              open={abrirAgregarEstudiante}
              onClose={cerrarDialogEstudiante}
              onSubmit={cerrarDialogAgregarEstudiante}
            />
            <CambiarFecha
              open={openFechaGrado}
              onClose={cerrarDialogCambiarFechaGrado}
              estudiante={estudiante || {}}
              onSubmit={cerrarDialogFechaGradoCambiada}
            />
            <Grid container>

              {estudiantes.map((estudiante) => (
                <Grid item key={estudiante.num_identificacion} xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                      <Typography variant="h6" color="primary">
                        Nombre
                      </Typography>
                      <TextField
                        value={estudiante.nombre || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                      <Typography variant="h6" color="primary">
                        Correo electrónico
                      </Typography>
                      <TextField
                        value={estudiante.correo || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                      <Typography variant="h6" color="primary">
                        Número de Identificación
                      </Typography>
                      <TextField
                        value={estudiante.num_identificacion || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2} xl={2}>
                      <Typography variant="h6" color="primary">
                        Fecha de grado
                      </Typography>
                      <TextField
                        value={estudiante.fecha_grado || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                        <Tooltip title="Quitar estudiante">
                          <IconButton variant="outlined" color='naranja' size="large" onClick={() => abrirConfirmarEliminacion(estudiante)} sx={{ marginLeft: '8px' }}>
                            <Remove fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modificar fecha de grado">
                          <IconButton variant="outlined" color='secondary' size="large" onClick={() => abrirDialogCambiarFechaGrado(estudiante)} sx={{ marginLeft: '8px' }}>
                            <EventAvailable fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Box>
          {proyecto.acronimo !== "AUX" && proyecto.acronimo !== "COT" && (
            <> <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                <Typography variant="h4" color="secondary" sx={{ mt: "20px", mb: "20px", flexGrow: 1, maxWidth: '98%' }}>
                  Jurado(s)
                </Typography>

              </Box>
              <Grid container spacing={2}>
                {listaJurado.map((jurado, index) => (
                  <Fragment key={jurado.id}>
                    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                        <Box sx={{ mr: "20px", flexGrow: 1, maxWidth: '90%' }}>
                          <Typography variant="h6" color="primary">
                            Nombre
                          </Typography>
                          <TextField value={jurado.nombre || ''} fullWidth />
                        </Box>
                        <Tooltip title="Ver/Cambiar Jurado">
                          <IconButton
                            color="secondary"
                            onClick={() => abrirDialog(jurado, 'modificar', 'JURADO')}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Fragment>
                ))}
                {listaJurado.length < 1 && proyecto.acronimo === "DT" ? (
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <Box sx={{ alignItems: 'center', flexGrow: 1 }}>
                      <Typography variant="h6" color="primary">
                        Asignar Jurado
                      </Typography>
                      <Tooltip title="Asignar Jurado">
                        <IconButton color="secondary" onClick={() => abrirDialog(proyecto, 'asignar', 'JURADO')}>
                          <Person />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                ) : (
                  listaJurado.length < 2 && proyecto.acronimo === "IT" && (
                    <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                      <Box sx={{ alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h6" color="primary">
                          Asignar Jurado
                        </Typography>
                        <Tooltip title="Asignar Jurado">
                          <IconButton color="secondary" onClick={() => abrirDialog(proyecto, 'asignar', 'JURADO')}>
                            <Person />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  )
                )}

              </Grid>

            </Box>
            </>
          )}
        </Box>
      ) : (
        <Typography variant="h6" color="primary">Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.</Typography>
      )}

      <Box mt={4}>
        <Typography variant="h4" color="secondary" fontWeight="bold">
          ENTREGAS
        </Typography>
        <VerEntrega
          open={openDialog}
          onClose={generacerrarDialogVerEntrega}
          entrega={entrega}
          tipo={tipo}
        />
        <Typography variant="h5" color="primary" sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={entregasPendientes} columns={columnaPendientes} mensaje="No hay entregas pendientes" />

        <Typography variant="h5" color="primary" sx={{ mt: "30px" }}>
          Entregas sin calificar
        </Typography>
        <CustomDataGrid rows={entregasPorCalificar} columns={columnaPorCalificar} mensaje="No hay entregas sin calificar" />

        <Typography variant="h5" color="primary" sx={{ mt: "30px" }}>
          Entregas calificadas
        </Typography>
        <CustomDataGrid rows={entregasCalificadas} columns={columnaCalificadas} mensaje="No hay entregas calificadas" />

      </Box>
      <Dialog
        open={confirmarEliminacion}
        keepMounted
        onClose={handleClose}
      >
        <DialogTitle variant="h1" color="primary">
          ¿Está seguro de que quiere retirar al estudiante?
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="h4">
            Puede volver a asignar al estudiante a este u otro proyecto.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="naranja">Cancelar</Button>
          <Button onClick={() => { quitarEstudiante(estudiante); }} variant="contained" sx={{ width: 150 }}>Continuar</Button>
        </DialogActions>
      </Dialog>
      <VerModificarUsuario
        open={abrirVerModificarUsuario}
        onSubmit={cerrarUsuarioCambiado}
        onClose={cerrarDialog}
        informacion={info}
        rol={rol}
        accion={accion} />
    </div>
  );
}
