import React, { useState, useEffect } from 'react';

import { Box, Typography, Alert, useTheme, Snackbar, Tooltip, IconButton } from '@mui/material';
import { Source, PostAdd } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";
import Entrega from './ReEntrega/Entrega';

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
 import { useSnackbar } from 'notistack';
export default function Entregas() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);
  const id_usuario = 5;
  const [rowsPendientes, setRowsPendientes] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
      enqueueSnackbar(mensaje, { variant: variante });
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    llenarTablaPendientes(proyecto_id);
  
  }, []);

  const llenarTablaPendientes = async (id_usuario) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/entrega/pendientes/${id_usuario}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message,"warning")
      } else if (response.status === 200) {
        setRowsPendientes(data.espacios);
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };

  const handleOpenDialog = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitDocumento = () => {

    setOpenDialog(false);
    llenarTablaPendientes(proyecto_id)
  };

  const columnas = [
    {
      field: "Acción",
      flex: 0.1,
      minWidth: 50,
      headerAlign: "center",
      align: "center",
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
    { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
    { field: 'descripcion', headerName: 'Descripción', flex: 0.3, minWidth: 150, headerAlign: "center", align: "center" },
    { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.15, minWidth: 100, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.15, minWidth: 100, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    { field: 'nombre_rol', headerName: 'Calificador', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center" }
  ];
  return (
    <div>
      <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold">
        ENTREGAS
      </Typography>
      <Box sx={{
        m: 2,
        "& .MuiDataGrid-root": {
          border: "none",
        },
        "& .MuiDataGrid-cellContent": {
          textAlign: "center"
        },
        "& .MuiDataGrid-columnHeaders": {
          color: colors.primary[100],
          textAlign: "center",
          fontSize: 14
        },
        "& .MuiDataGrid-toolbarContainer": {
          justifyContent: 'flex-end',
          align: "right"
        }
      }}
      >
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={rowsPendientes} columns={columnas} mensaje="No entregas pendientes" />
        <Entrega
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitDocumento}
          entrega={selectedRow || {}}
        />
      </Box>
    </div>
  );
};
