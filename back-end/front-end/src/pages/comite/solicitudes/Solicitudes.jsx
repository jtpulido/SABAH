import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, IconButton, Tooltip } from "@mui/material";
import { Source, Feed } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import VerSolicitud from './VerSolicitud';

import CustomDataGrid from "../../layouts/DataGrid";

import { useSnackbar } from 'notistack';

export default function Proyectos() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const [rowsEnCurso, setRowsEnCurso] = useState([]);
  const [rowsAprobadas, setRowsAprobadas] = useState([]);
  const [rowsRechazadas, setRowsRechazadas] = useState([]);
  const [idSolicitud, setIdSolicitud] = useState(null);
  const navigate = useNavigate();

  const generarColumnas = (extraColumns) => {
    const commonColumns = [
      {
        field: "Acción", headerName: "", flex: 0.01, minWidth: 50,
        renderCell: ({ row }) => {
          const { id, id_proyecto } = row;
          return (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Box mr="5px">
                <Tooltip title="Ver Solicitud" >
                  <IconButton color="secondary" onClick={() => abrirDialog(id)}>
                    <Feed />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box ml="5px">
                <Tooltip title="Ver proyecto">
                  <IconButton color="secondary" onClick={() => verProyecto(id_proyecto)}>
                    <Source />
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
      { field: 'codigo_proyecto', headerName: 'Código', flex: 0.1, minWidth: 100 },
      {
        field: 'etapa_estado', headerName: 'Estado Proyecto', flex: 0.2, minWidth: 100,
        valueGetter: (params) =>
          `${params.row.etapa_proyecto || ''} - ${params.row.estado || ''}`,
      },

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
    { field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.1 },
    { field: 'fecha_aprobado_comite', headerName: 'Rechazada Comité', flex: 0.1 }
  ]);

  const verProyecto = (id) => {
    navigate(`/comite/verProyecto/${id}`)
  }

  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/solicitudes/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsFunc(data.solicitudes);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };

  useEffect(() => {
    llenarTabla("pendienteaprobacion", setRowsEnCurso);
    llenarTabla("rechazadas", setRowsRechazadas);
    llenarTabla("aprobadas", setRowsAprobadas);
  }, []);

  const [open, setOpen] = useState(false);

  const abrirDialog = (id) => {
    setIdSolicitud(id)
    setOpen(true);
  };

  const cerrarDialog = () => {
    setOpen(false);
  }
  const recargarAprobacion = () => {
    llenarTabla("pendienteaprobacion", setRowsEnCurso);
    llenarTabla("rechazadas", setRowsRechazadas);
    llenarTabla("aprobadas", setRowsAprobadas);
  }
  return (
    <div style={{ margin: "15px" }} >

      <VerSolicitud
        open={open}
        onClose={cerrarDialog}
        onSubmit={recargarAprobacion}
        id_solicitud={idSolicitud}
      />
      <Typography
        variant="h1"
        color="secondary"
        fontWeight="bold"
      >
        SOLICITUDES
      </Typography>

      <Box   >
        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Pendientes
        </Typography>
        <CustomDataGrid rows={rowsEnCurso} columns={columnsPendientes} mensaje="No hay solicitudes" />

        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Aprobadas
        </Typography>
        <CustomDataGrid rows={rowsAprobadas} columns={columnsAprobadas} mensaje="No hay solicitudes" />

        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Rechazadas
        </Typography>
        <CustomDataGrid rows={rowsRechazadas} columns={columnsRechazadas} mensaje="No hay solicitudes" />

      </Box>

    </div>
  );
}