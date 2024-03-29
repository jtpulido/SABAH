import React, { useState, useEffect } from "react";

import { Box, Typography, IconButton, Tooltip, Toolbar, AppBar, Button } from "@mui/material";
import { Feed, AddCircleOutline } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";

import CustomDataGrid from "../layouts/DataGrid";

import { useSnackbar } from 'notistack';

import VerSolicitud from './VentanasSolicitud/VerSolicitud';
import CrearSolicitud from "./VentanasSolicitud/CrearSolicitud";


export default function Proyectos() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const token = useSelector(selectToken);
  const id = sessionStorage.getItem('id_proyecto');
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const [rowsEnCurso, setRowsEnCurso] = useState([]);
  const [rowsAprobadas, setRowsAprobadas] = useState([]);
  const [rowsRechazadas, setRowsRechazadas] = useState([]);
  const [idSolicitud, setIdSolicitud] = useState(null);

  const generarColumnas = (extraColumns) => {
    const commonColumns = [
      {
        field: "Acción", headerName: "", flex: 0.01, minWidth: 50,
        renderCell: ({ row }) => {
          const { id } = row;
          return (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Box mr="5px">
                <Tooltip title="Ver Solicitud" >
                  <IconButton color="secondary" onClick={() => abrirDialog(id)}>
                    <Feed />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          );
        },
      },
      { field: 'creado_por', headerName: 'Creado por', flex: 0.1, valueFormatter: ({ value }) => (value ? 'Proyecto' : 'Director') },
      { field: 'tipo_solicitud', headerName: 'Tipo de solicitud', flex: 0.2, minWidth: 150 },
      { field: 'fecha_solicitud', headerName: 'Fecha de solicitud', flex: 0.1, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    ];

    return [...commonColumns, ...extraColumns];
  };

  const columnsPendientes = generarColumnas([{
    field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.1
  }]);
  const columnsAprobadas = generarColumnas([
    { field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.1 },
    { field: 'fecha_aprobado_comite', headerName: 'Aprobado Comité', flex: 0.1 }
  ]);
  const columnsRechazadas = generarColumnas([
    { field: 'fecha_director', headerName: 'Respuesta Director', flex: 0.1 },
    { field: 'fecha_aprobado_comite', headerName: 'Rechazada Comité', flex: 0.1 }
  ]);

  const llenarTabla = async (endpoint, setRowsFunc, id) => {
    try {
      const response = await fetch(`${apiBaseUrl}/proyecto/${endpoint}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setRowsFunc(data.solicitudes);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };

  useEffect(() => {
    llenarTabla("obtenerSolicitudesPendientes", setRowsEnCurso, id);
    llenarTabla("obtenerSolicitudesRechazadas", setRowsRechazadas, id);
    llenarTabla("obtenerSolicitudesAprobadas", setRowsAprobadas, id);
  }, []);

  const [open, setOpen] = useState(false);

  const abrirDialog = (id) => {
    setIdSolicitud(id)
    setOpen(true);
  };

  const cerrarDialog = () => {
    setOpen(false);
  }

  const [abrirCrear, setAbrirCrear] = useState(false);

  const abrirCrearSolicitud = () => {
    setAbrirCrear(true);
  };

  const cerrarCrearSolicitud = () => {
    setAbrirCrear(false);
  }
  const cerrarSolicitudAgregada = () => {
    llenarTabla("obtenerSolicitudesPendientes", setRowsEnCurso, id);
    setAbrirCrear(false);
  };

  return (
    <div >
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            SOLICITUDES
          </Typography>
          <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirCrearSolicitud} sx={{
            width: 150,
          }}>
            Crear Solicitud
          </Button>
        </Toolbar>
      </AppBar>
      <VerSolicitud
        open={open}
        onClose={cerrarDialog}
        id_solicitud={idSolicitud}
      />
      <CrearSolicitud
        open={abrirCrear}
        onClose={cerrarCrearSolicitud}
        onSubmit={cerrarSolicitudAgregada}
      />

      <Box sx={{ m: 3 }}>
        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Pendientes
        </Typography>
        <CustomDataGrid rows={rowsEnCurso} columns={columnsPendientes} mensaje="No hay solicitudes pendientes." />

        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Aprobadas
        </Typography>
        <CustomDataGrid rows={rowsAprobadas} columns={columnsAprobadas} mensaje="No hay solicitudes aprobadas." />

        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Rechazadas
        </Typography>
        <CustomDataGrid rows={rowsRechazadas} columns={columnsRechazadas} mensaje="No hay solicitudes rechazadas." />

      </Box>

    </div>
  );
}