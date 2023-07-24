import React, { useState, useEffect } from 'react';

import { Box, Typography, useTheme, Tooltip, IconButton, Toolbar, AppBar } from '@mui/material';
import { Source } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CalificarEntrega from './Ventanas/Calificar';

export default function Entregas() {
 
  const token = useSelector(selectToken);
  const [entrega, setEntrega] = useState(null);
  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsCalificadas, setRowsCalificadas] = useState([]);
  const [rowsPorCalificar, setRowsPorCalificar] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };


  const llenarTabla = async (url, setData) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/entregas/${url}`, {
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

  const abrirDialogCalificar = (row) => {
    setEntrega(row)
    setOpenCalificar(true);
  };
  const cerrarDialogCalificado = () => {
    setEntrega({})
    llenarTabla("pendientes", setRowsPendientes);
    llenarTabla("realizadas/calificadas", setRowsCalificadas);
    llenarTabla("realizadas/porCalificar", setRowsPorCalificar);
    setOpenCalificar(false);
  }
  const cerrarDialogCalificar = () => {
    setEntrega({})
    setOpenCalificar(false);
  }
  useEffect(() => {
    llenarTabla("pendientes", setRowsPendientes);
    llenarTabla("realizadas/calificadas", setRowsCalificadas);
    llenarTabla("realizadas/porCalificar", setRowsPorCalificar);
  }, []);

  const generarColumnas = (extraColumns) => {
    const columns = [
      { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.3, minWidth: 200, align: "center" },
      { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.1, minWidth: 100, align: "center" },    
      { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 150, align: "center" },
      { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100, align: "center" }
     ]
    return [...columns, ...extraColumns];
  };

  const columnaPendientes = generarColumnas([
    { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    {
      field: "pendiente",
      flex: 0.1,
      minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" ml="10px" display="flex" justifyContent="center">
            <Tooltip title="Ver Entrega">
              <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "pendiente")}>
                <Source />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ]);
  const columnaPorCalificar = generarColumnas([
    { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },   
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.2, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    {
      field: "calificar",
      flex: 0.1,
      minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" ml="10px" display="flex" justifyContent="center">
            <Tooltip title="Ver entrega">
              <IconButton color="secondary" onClick={() => abrirDialogCalificar(row)}>
                <Source />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ]);
  const columnaCalificadas = generarColumnas([
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_evaluacion', headerName: 'Fecha de evaluación', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'nota_final', headerName: 'Nota', flex: 0.1, minWidth: 100 },
    {
      field: "calificado",
      headerName: "",
      flex: 0.1,
      minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" ml="10px" display="flex" justifyContent="center">
            <Tooltip title="Calificar">
              <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "calificado")}>
                <Source />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }

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
      <CalificarEntrega
        open={openCalificar}
        onClose={cerrarDialogCalificar}
        onSubmit={cerrarDialogCalificado}
        entrega={entrega}
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
