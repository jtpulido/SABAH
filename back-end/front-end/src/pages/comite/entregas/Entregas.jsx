import React, { useState, useEffect } from 'react';

import { Box, Typography, Tooltip, IconButton, Toolbar, AppBar } from '@mui/material';
import { Source } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import VerEntrega from './Ventanas/VerEntrega';

export default function Entregas() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const token = useSelector(selectToken);
  const [entrega, setEntrega] = useState({});
  const [tipo, setTipo] = useState("");
  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsCalificadas, setRowsCalificadas] = useState([]);
  const [rowsPorCalificar, setRowsPorCalificar] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };


  const llenarTabla = async (url, setData) => {
    try {
      const response = await fetch(`${apiBaseUrl}/comite/entregas/${url}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setData(data.entregas);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };
  const [openCalificar, setOpenCalificar] = useState(false);

  const abrirDialogCalificar = (row, tipo = "") => {
    setEntrega(row)
    setTipo(tipo)
    setOpenCalificar(true);
  };

  const cerrarDialogCalificar = () => {
    setEntrega({})
    setOpenCalificar(false);
  }
  useEffect(() => {
    llenarTabla("pendientes", setRowsPendientes);
    llenarTabla("realizadas/calificadas", setRowsCalificadas);
    llenarTabla("realizadas/porCalificar", setRowsPorCalificar);
  }, []);

  const generarColumnas = (inicio, extraColumns) => {
    const columns = [
      { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.2, minWidth: 300 },
      { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 200 },
      { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100 },
      { field: 'etapa', headerName: 'Etapa', flex: 0.1, minWidth: 150 },
      { field: 'anio', headerName: 'Año', flex: 0.1, minWidth: 100 },
      { field: 'periodo', headerName: 'Periodo', flex: 0.1, minWidth: 100 }
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
    { field: 'estado_entrega', headerName: 'Estado', flex: 0.2, minWidth: 100 },
  ]);
  const columnaPorCalificar = generarColumnas([{
    field: "calificar",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Calificar">
            <IconButton color="secondary" onClick={() => abrirDialogCalificar(row)}>
              <Source />
            </IconButton>
          </Tooltip>
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
  return (
    <div>
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            ESPACIOS DE ENTREGAS
          </Typography>
        </Toolbar>
      </AppBar>
      <VerEntrega
        open={openCalificar}
        onClose={cerrarDialogCalificar}
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
    </div>
  );
};
