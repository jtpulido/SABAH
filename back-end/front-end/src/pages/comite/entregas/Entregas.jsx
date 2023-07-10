import React, { useState, useEffect } from 'react';

import { Box, Typography, useTheme, Tooltip, IconButton } from '@mui/material';
import { Source, PostAdd } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';
export default function Entregas() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);

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
        method: "POST",
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
  const handleOpenDialog = (row) => {

  }

  useEffect(() => {
    llenarTabla("pendientes", setRowsPendientes);    
    llenarTabla("realizadas/calificadas", setRowsCalificadas);
    llenarTabla("realizadas/porCalificar", setRowsPorCalificar);
  }, []);


  const columnas = [
    {
      field: "Acción",
      flex: 0.1,
      minWidth: 50,
      
      
      renderCell: ({ row }) => {
        return (
          <Box width="100%" ml="10px" display="flex" justifyContent="center">
            <Tooltip title="Ver entrega">
              <IconButton color="secondary" onClick={() => handleOpenDialog(row)}>
                <Source />
              </IconButton>
            </Tooltip>
            <Tooltip title="Añadir entrega">
              <IconButton color="secondary" onClick={() => handleOpenDialog(row)}>
                <PostAdd />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.2, minWidth: 150,  align: "center" },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.3, minWidth: 150,   valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.15, minWidth: 100,  align: "center" },
    { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.15, minWidth: 100,  align: "center" },
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 100,  align: "center" }
  ];

  const generarColumnas = (extraColumns) => {
    const columns = [
      
      { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 150,  align: "center" },
      { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100,  align: "center" },
      { field: 'fecha_apertura', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100,   valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
      { field: 'fecha_cierre', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100,   valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
     { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.4, minWidth: 200,  align: "center" },
      { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.1, minWidth: 100,  align: "center" }
    ]
    return [...columns, ...extraColumns];
};

const columnaPendientes = generarColumnas([
]);
const columnaPorCalificar = generarColumnas([
  { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.2, minWidth: 150,   valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') }    
]);
const columnaCalificadas = generarColumnas([
  { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.2, minWidth: 150,   valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') } ,
  { field: 'fecha_evaluacion', headerName: 'Fecha de evaluación', flex: 0.2, minWidth: 150,   valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') } ,   
  { field: 'nota_final', headerName: 'Nota', flex: 0.1, minWidth: 100,  align: "center" }
   
]);
  return (
    <div>

      <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold">
        ENTREGAS
      </Typography>
      <Box >
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={rowsPendientes} columns={columnaPendientes} mensaje="No hay entregas pendientes" />
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Entregas por calificar
        </Typography>
        <CustomDataGrid rows={rowsPorCalificar} columns={columnaPorCalificar} mensaje="No entregas por calificar" />
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Entregas calificadas
        </Typography>
        <CustomDataGrid rows={rowsCalificadas} columns={columnaCalificadas} mensaje="No hay entregas calificadas" />

      </Box>
    </div>
  );
};
