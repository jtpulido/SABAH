import React, { useState, useEffect } from 'react';

import { Box, Typography, Tooltip, IconButton, Toolbar, AppBar } from '@mui/material';
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
      const response = await fetch(`http://localhost:5000/usuario/entregas/${url}/${id_usuario}/${id_rol}`, {
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

  const abrirDialogCalificar = (row, tipo) => {
    setEntrega(row)
    setTipo(tipo)
    setOpenCalificar(true);
  };
  const cerrarDialogCalificado = () => {
    setEntrega({})
    setRowsCalificadas([])
    setRowsPorCalificar([])
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
      { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.2, minWidth: 300 },
      { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 200 },
      { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100 }
    ]
    return [...columns, ...extraColumns];
  };

  const columnaPendientes = generarColumnas([
    { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    {
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
    }
  ]);
  const columnaPorCalificar = generarColumnas([
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
      { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    {
      field: "calificar",
      headerName: "",
      flex: 0.1,
      minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Tooltip title="Calificar">
              <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "calificar")}>
                <Source />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ]);
  const columnaCalificadas = generarColumnas([
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
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
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
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
