import React, { useState, useEffect } from 'react';

import { Box, Typography, Tooltip, IconButton, Toolbar, AppBar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Source } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CalificarEntrega from './Ventanas/Calificar';

export default function Entregas() {
  const id_usuario = sessionStorage.getItem('user_id_usuario');
  const id_rol = sessionStorage.getItem('id_rol');
  const token = useSelector(selectToken);
  const [entrega, setEntrega] = useState({});
  const [postulado, setPostulado] = useState({});
  const [tipo, setTipo] = useState("");
  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsCalificadas, setRowsCalificadas] = useState([]);
  const [rowsPorCalificar, setRowsPorCalificar] = useState([]);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const llenarTabla = async (url, setData) => {
    try {
      const response = await fetch(`http://localhost:5000/usuario/entregas/${url}/${id_usuario}/${id_rol}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setData(data.entregas);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };
  const [openCalificar, setOpenCalificar] = useState(false);

  const abrirDialogCalificar = (row, tipo) => {
    setEntrega(row)
    setTipo(tipo)
    setOpenCalificar(true);
  };
  const cerrarDialogCalificado = (postulado) => {
    if (postulado) {
      setPostulado(postulado)
      abrirConfirmarEliminacion()
    }
    setEntrega({})
    setRowsCalificadas([])
    setRowsPorCalificar([])
    llenarTabla("pendientes", setRowsPendientes);
    llenarTabla("realizadas/calificadas", setRowsCalificadas);
    llenarTabla("realizadas/porCalificar", setRowsPorCalificar);
    setOpenCalificar(false);
  };

  const cerrarDialogCalificar = () => {
    setEntrega({})
    setOpenCalificar(false);
  };
  useEffect(() => {
    llenarTabla("pendientes", setRowsPendientes);
    llenarTabla("realizadas/calificadas", setRowsCalificadas);
    llenarTabla("realizadas/porCalificar", setRowsPorCalificar);
  }, [id_rol, id_usuario]);

  const generarColumnas = (inicio, extraColumns) => {
    const columns = [
      { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.2, minWidth: 300 },
      { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 200 },
      { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100 }
    ]
    return [...inicio, ...columns, ...extraColumns];
  };

  const columnaPendientes = generarColumnas([{
    field: "ver",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Ver Entrega">
            <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "pendiente")}>
              <Source />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  }], [
    { field: 'fecha_apertura_entrega', headerName: 'Fecha de apertura entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre_entrega', headerName: 'Fecha de cierre entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_apertura_calificacion', headerName: 'Fecha de apertura calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre_calificacion', headerName: 'Fecha de cierre calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'estado_entrega', headerName: 'Estado', flex: 0.1, minWidth: 100 }
  ]);
  const columnaPorCalificar = generarColumnas([
    {
      field: "calificar",
      headerName: "",
      flex: 0.1,
      minWidth: 50,
      renderCell: ({ row }) => {
        let boton = null;
        if (row.estado === 'pendiente') {
          boton = (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Tooltip title="Calificar">
                <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "calificar")}>
                  <Source />
                </IconButton>
              </Tooltip>
            </Box>
          );
        } else if (row.estado === 'vencido') {
          // La fecha de cierre para calificar ya ha pasado
          boton = (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Tooltip title="Ver Entrega">
                <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "vencido")}>
                  <Source />
                </IconButton>
              </Tooltip>
            </Box>
          );
        } else if (row.estado === 'cerrado') {
          // La calificación está cerrada
          boton = (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Tooltip title="Ver Entrega">
                <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "cerrado")}>
                  <Source />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            {boton}
          </Box>
        );
      },
    }], [
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
    { field: 'fecha_apertura_entrega', headerName: 'Fecha de apertura entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre_entrega', headerName: 'Fecha de cierre entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_apertura_calificacion', headerName: 'Fecha de apertura calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre_calificacion', headerName: 'Fecha de cierre calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'estado', headerName: 'Estado', flex: 0.1, minWidth: 100 }

  ]);
  const columnaCalificadas = generarColumnas([{
    field: "calificado",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Calificar">
            <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "calificado")}>
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
  const postularMeritorio = async () => {

    try {
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
      handleClose()
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }
  const abrirConfirmarEliminacion = () => {
    setConfirmarEliminacion(true);
  };
  const handleClose = () => {
    setConfirmarEliminacion(false);
  };
  return (
    <div>
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            ESPACIOS DE ENTREGAS
          </Typography>
        </Toolbar>
      </AppBar>
      <CalificarEntrega
        open={openCalificar}
        onClose={cerrarDialogCalificar}
        onSubmit={cerrarDialogCalificado}
        entrega={entrega}
        tipo={tipo}
      />
      <Box sx={{ m: 2 }}>
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={rowsPendientes} columns={columnaPendientes} mensaje="No hay entregas pendientes" />
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas por calificar
        </Typography>
        <CustomDataGrid rows={rowsPorCalificar} columns={columnaPorCalificar} mensaje="No entregas por calificar" />
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas calificadas
        </Typography>
        <CustomDataGrid rows={rowsCalificadas} columns={columnaCalificadas} mensaje="No hay entregas calificadas" />

      </Box>
      <Dialog
        open={confirmarEliminacion}
        keepMounted
        onClose={handleClose}
      >
        <DialogTitle variant="h1" color="primary">
          ¿Está seguro de que quiere postular este proyecto?
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="h4">
            Los jurados o en el caso de la opción Auxiliar de Investigación el investigador podrán incluir la postulación a
            mención honorífica al Comité de Opciones de Grado, que seleccionará un proyecto por opción de grado, siguiendo los criterios mostrados a continuación:
          </DialogContentText>
          <DialogContentText variant="h4">
            ● La pertinencia del trabajo en cuanto a la orientación estratégica de la Universidad (salud y calidad de vida)
          </DialogContentText>
          <DialogContentText variant="h4">
            ● La relación con otros entes, facultades, departamentos o dependencias para el desarrollo del proyecto (interdisciplinariedad).
          </DialogContentText>
          <DialogContentText variant="h4">
            ● Los resultados, utilidad del mismo y la posibilidad de continuar en fases posteriores el proyecto.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="naranja">Cancelar</Button>
          <Button onClick={() => { postularMeritorio() }} variant="contained" sx={{ width: 150 }}>Postular</Button>
        </DialogActions>
      </Dialog>
    </div >
  );
};
