import React, { useState, useEffect, Fragment } from "react";
import { Typography, Box, TextField, Grid, CssBaseline, Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import './VerProyecto.css';

import CambiarCodigo from './Ventana/CambiarCodigo';
import CambiarNombre from './Ventana/CambiarNombre';
import { Add, Edit, EditAttributes, EditCalendar, EditNote, EventAvailable, Person, Remove } from "@mui/icons-material";

import { useSnackbar } from 'notistack';
import AgregarEstudiante from "./Ventana/AgregarEstudiante";
import VerModificarUsuario from "../usuarios_normales/Ventana/VerModificarUsuario";
import CambiarFecha from "./Ventana/CambiarFecha";
import CambiarEtapa from "./Ventana/CambiarEtapa";
import CambiarEstado from "./Ventana/CambiarEstado";
import TerminarProyecto from "./Ventana/TerminarProyecto";
import ProgramarSustentacion from "./Ventana/ProgramarSustentacion";
import CambiarProgramacionSustentacion from "./Ventana/CambiarProgramacionSustentacion";

export default function VerProyectos() {

  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const [existe, setExiste] = useState([]);
  const [proyecto, setProyecto] = useState({});
  const [estudiantes, setEstudiantes] = useState([]);
  const [director, setDirector] = useState({});
  const [lector, setLector] = useState({});
  const [existeLector, setExisteLector] = useState(false);
  const [listaJurado, setListaJurado] = useState([]);
  const [estudiante, setEstudiante] = useState({});
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [abrirAgregarEstudiante, setAbrirAgregarEstudiante] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTerminar, setOpenTerminar] = useState(false);
  const [openNombre, setOpenNombre] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openEtapa, setOpenEtapa] = useState(false);
  const [openFechaGrado, setOpenFechaGrado] = useState(false);
  const [openSustentacion, setOpenSustentacion] = useState(false);
  const [openModificarSustentacion, setOpenModificarSustentacion] = useState(false);
  const [rol, setRol] = useState("");
  const [info, setInfo] = useState({});
  const [accion, setAccion] = useState("");
  const [abrirVerModificarUsuario, setAbrirVerModificarUsuario] = useState(false);
  const [existeCliente, setExisteCliente] = useState(false);
  const [listaCliente, setListaCliente] = useState([]);
  const [existeSustentacion, setExisteSustentacion] = useState(false);
  const [sustentacion, setSustentacion] = useState({});


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
        setListaJurado(data.jurados.existe_jurado ? data.jurados.jurados : []);
        setExisteCliente(data.cliente.existe_cliente)
        setListaCliente(data.cliente.existe_cliente ? data.cliente : []);
        setExiste(true)
        setExisteSustentacion(data.sustentacion.existe_sustentacion)
        setSustentacion(data.sustentacion.existe_sustentacion ? data.sustentacion.sustentacion : null)
      }
    }
    catch (error) {
      setExiste(false)
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  };

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
  const postularMeritorio = async () => {
    try {
      const postulado = {
        id: proyecto.id,
        id_modalidad: proyecto.id_modalidad,
        anio: proyecto.anio,
        periodo: proyecto.periodo

      };
      const response = await fetch(`http://localhost:5000/comite/proyecto/postulado`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postulado })
      })
      const data = await response.json();
      if (response.status === 400) {
        mostrarMensaje(data.message, "info");
      } else if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else {
        mostrarMensaje(data.message, "success");

      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
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
  const actualizarEtapa = (cambio) => {
    setProyecto((prevState) => ({
      ...prevState,
      anio: cambio.anio,
      periodo: cambio.periodo,
      id_etapa: cambio.id_etapa,
      etapa: cambio.etapa,
      id_estado: cambio.id_estado,
      estado: cambio.estado
    }));
  };
  const actualizarEstado = (cambio) => {
    setProyecto((prevState) => ({
      ...prevState,
      id_estado: cambio.id_estado,
      estado: cambio.estado
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
  const cerrarDialogCodigoCambiado = async (newValue) => {
    setOpen(false);
    if (newValue) {
      actualizarProyecto(newValue)
    };
  }
  const abrirDialogTerminar = () => {
    setOpenTerminar(true);
  };
  const cerrarDialogTerminar = async () => {
    setOpenTerminar(false);
  }
  const cerrarDialogTerminado = async (newValue) => {
    setOpenTerminar(false);

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
  const abrirDialogCambiarEstado = () => {
    setOpenEstado(true);
  };
  const cerrarDialogCambiarEstado = () => {
    setOpenEstado(false);
  }
  const cerrarDialogEstadoCambiado = (newValue) => {
    actualizarEstado(newValue)
    setOpenEstado(false);
  }
  const abrirDialogCambiarEtapa = () => {
    setOpenEtapa(true);
  };
  const cerrarDialogCambiarEtapa = () => {
    setOpenEtapa(false);
  }
  const cerrarDialogEtapaCambiado = (newValue) => {
    actualizarEtapa(newValue)
    setOpenEtapa(false);
  }
  const abrirVentanaAgregarEstudiante = () => {
    setAbrirAgregarEstudiante(true);
  };
  const cerrarDialogEstudiante = () => {
    setAbrirAgregarEstudiante(false);
  }
  const cerrarDialogAgregarEstudiante = async (estudiantes) => {
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
  const abrirDialogProgramarSustentacion = () => {
    const new_sustentacion = {
      id_proyecto: id,
      anio: proyecto.anio,
      periodo: proyecto.periodo
    };
    setSustentacion(new_sustentacion)
    setOpenSustentacion(true);
  };

  const cerrarDialogProgramarSustentacion = () => {
    setOpenSustentacion(false);
  }
  const cerrarDialogSustentacionProgramada = (newValue) => {
    setOpenSustentacion(false);
    if (newValue) {
      setExisteSustentacion(true)
      setSustentacion(newValue)
    };
  }
  const abrirDialogModificarSustentacion = () => {
    setOpenModificarSustentacion(true);
  };

  const cerrarDialogModificarSustentacion = () => {
    setOpenModificarSustentacion(false);
  }
  const cerrarDialogSustentacionModificada = (newValue) => {
    setOpenModificarSustentacion(false);
    if (newValue) {
      setSustentacion(newValue)
    };
  }
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
        } else {
          setListaJurado({})
        }
      }
    }
    setAbrirVerModificarUsuario(false);
  }
  useEffect(() => {
    infoProyecto()
  }, [id]);


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
            variant="h4"
          >
            {proyecto.nombre || ''}
          </Typography>
          <Typography
            variant="h4"
          >
            {proyecto.codigo || ''}
          </Typography>
          {proyecto && proyecto.codigo && proyecto.codigo.startsWith("TEM") ? (
            <Button variant="outlined" disableElevation size="small" onClick={() => asignarCodigo(id, proyecto.acronimo, proyecto.anio, proyecto.periodo)} sx={{
              width: 200, m: 1
            }}>
              Asignar Código
            </Button>
          ) : (
            <Button variant="outlined" disableElevation size="small" onClick={abrirDialogCambiarCodigo} sx={{
              width: 200, m: 1
            }}>
              Modificar código
            </Button>
          )}

          <Button variant="outlined" disableElevation size="small" onClick={abrirDialogCambiarNombre} sx={{ width: 200, m: 1 }}>
            Modificar nombre
          </Button>
          <Button variant="outlined" disableElevation size="small" onClick={abrirDialogCambiarEtapa} sx={{ width: 200, m: 1 }}>
            Cambiar etapa
          </Button>
          <Button variant="outlined" disableElevation size="small" onClick={abrirDialogCambiarEstado} sx={{ width: 200, m: 1 }}>
            Cambiar estado
          </Button>
          {proyecto.etapa === 'Proyecto de grado 2' && proyecto.estado === 'En desarrollo' && proyecto.acronimo !== 'COT' ? (
            <div>
              <Button variant="outlined" disableElevation size="small" onClick={abrirDialogProgramarSustentacion} sx={{ width: 200, m: 1 }}>
                Programar Sustentación
              </Button>

            </div>
          ) : null}
          {proyecto.estado === 'Aprobado' ? (
            <div>
              <Button variant="outlined" disableElevation size="small" onClick={abrirDialogTerminar} sx={{ width: 200, m: 1 }}>
                Terminar Proyecto
              </Button>
              <Button variant="outlined" disableElevation size="small" onClick={postularMeritorio} sx={{ width: 200, m: 1 }}>
                Postular a meritorio
              </Button>
            </div>
          ) : null}
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
          <CambiarEstado
            open={openEstado}
            onClose={cerrarDialogCambiarEstado}
            onSubmit={cerrarDialogEstadoCambiado}
            proyecto={proyecto}
          />
          <CambiarEtapa
            open={openEtapa}
            onClose={cerrarDialogCambiarEtapa}
            onSubmit={cerrarDialogEtapaCambiado}
            proyecto={proyecto}
          />
          <TerminarProyecto
            open={openTerminar}
            onClose={cerrarDialogTerminar}
            onSubmit={cerrarDialogTerminado}
            proyecto={proyecto}
          />
          <ProgramarSustentacion
            open={openSustentacion}
            onClose={cerrarDialogProgramarSustentacion}
            sustentacion={sustentacion || {}}
            onSubmit={cerrarDialogSustentacionProgramada}
          />
          <CambiarProgramacionSustentacion
            open={openModificarSustentacion}
            onClose={cerrarDialogModificarSustentacion}
            sustentacion={sustentacion || {}}
            onSubmit={cerrarDialogSustentacionModificada}
          />
          <Box >
            <Typography variant="h4" color="secondary" sx={{ mt: "40px", mb: "15px" }}>
              Información General
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Typography variant="h6" color="primary">
                  Modalidad
                </Typography>
                <TextField value={proyecto.modalidad || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Typography variant="h6" color="primary">
                  Etapa
                </Typography>
                <TextField value={proyecto.etapa || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Typography variant="h6" color="primary">
                  Estado
                </Typography>
                <TextField value={proyecto.estado || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Typography variant="h6" color="primary">
                  Año
                </Typography>
                <TextField value={proyecto.anio || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
                <Typography variant="h6" color="primary">
                  Período
                </Typography>
                <TextField value={proyecto.periodo || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={4}>
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
                  <Grid item xs={12} sm={12} md={6} lg={4}>
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
          {proyecto.acronimo == "DT" && (
            <> <Box>

              <Typography variant="h4" color="secondary" sx={{ mt: "40px", mb: "15px" }}>
                Cliente
              </Typography>
              {existeCliente ? (
                <Grid container spacing={2}>
                  <Grid item sm={6} md={4} lg={4} xl={3}>
                    <Typography variant="h6" color="primary">
                      Nombre Cliente
                    </Typography>
                    <TextField
                      value={listaCliente.empresa || ''}
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={6} md={4} lg={4} xl={3}>
                    <Typography variant="h6" color="primary">
                      Representante Cliente
                    </Typography>
                    <TextField
                      value={listaCliente.representante || ''}
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={6} md={4} lg={4} xl={3}>
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
          {proyecto.acronimo !== "COT" && (
            <>
              <Box>

                <Typography variant="h4" color="secondary" sx={{ mt: "40px", mb: "15px" }}>
                  Sustentación
                </Typography>
                {existeSustentacion ? (
                  <Grid container spacing={2}>
                    <Grid item sm={6} md={4} lg={4} xl={3}>
                      <Typography variant="h6" color="primary">
                        Fecha
                      </Typography>
                      <TextField
                        value={sustentacion.fecha_sustentacion || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item sm={6} md={4} lg={4} xl={3}>
                      <Typography variant="h6" color="primary">
                        Lugar
                      </Typography>
                      <TextField
                        value={sustentacion.lugar || ''}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
                        <Tooltip title="Programar Sustentación">
                          <IconButton color="secondary" size="large" onClick={abrirDialogModificarSustentacion}>
                            <EditNote fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>

                ) : (<Typography variant="h6" color="primary">No se han asignado una fecha de sustentación</Typography>
                )}
              </Box>
            </>
          )}
          <Box>
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>
              <Typography variant="h4" color="secondary" sx={{ mt: "40px", mb: "5px", flexGrow: 1, maxWidth: '98%' }}>
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
                <Grid item key={estudiante.num_identificacion} xs={12} sx={{ mt: '15px' }}>
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
                            <EditCalendar fontSize="inherit" />
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
                <Typography variant="h4" color="secondary" sx={{ mt: "40px", mb: "15px", flexGrow: 1, maxWidth: '98%' }}>
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
