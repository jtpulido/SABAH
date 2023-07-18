import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, IconButton } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';

import { Visibility } from '@mui/icons-material';
import "./Proyectos.css";
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport
} from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function Proyectos() {
  const navigate = useNavigate();
  const columns = [
    {
      field: 'nombre', headerName: 'Nombre', flex: 0.3, minWidth: 150,
      headerAlign: "center"
    },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center" },
    { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
    { field: 'anio', headerName: 'Año', flex: 0.05, minWidth: 100, headerAlign: "center", align: "center" },
    { field: 'periodo', headerName: 'Periodo', flex: 0.05, minWidth: 100, headerAlign: "center", align: "center" },
    { field: 'etapa', headerName: 'Etapa', flex: 0.15, minWidth: 100, headerAlign: "center", align: "center" },
    { field: 'estado', headerName: 'Estado', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
    {
      field: "id",
      headerName: "Acción",
      width: 100,
      flex: 0.05, minWidth: 100, headerAlign: "center", align: "center",
      renderCell: ({ row: { id } }) => {
        return (
          <Box
            width="100%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
          >
            <Tooltip title="Ver Proyecto" sx={{ fontSize: '20px' }}>
              <IconButton aria-label="fingerprint" color="secondary" onClick={() => verProyecto(id)}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ];

  const verProyecto = (id) => {
    sessionStorage.setItem('admin_id_proyecto', id);
    navigate(`/admin/verProyecto`)
  }

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);
  const [rowsEnCurso, setRowsEnCurso] = useState([]);
  const [rowsTerminados, setRowsTerminados] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const llenarTablaEnCurso = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/obtenerEnCurso", {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else if (data.message === 'No hay proyectos actualmente') {
        setRowsEnCurso([]);
      } else {
        setRowsEnCurso(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [token]);

  const llenarTablaCerrados = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/obtenerTerminados", {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else if (data.message === 'No hay proyectos actualmente') {
        setRowsTerminados([]);
      } else {
        setRowsTerminados(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [token]);

  useEffect(() => {
    llenarTablaEnCurso()
    llenarTablaCerrados()
  }, [llenarTablaEnCurso, llenarTablaCerrados]);

  const CustomNoRowsMessage = (mensaje) => {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        {mensaje}
      </div>
    );
  }

  return (
    <div style={{ margin: "15px" }} >
      <Typography
        variant="h1"
        color={colors.secundary[100]}
        fontWeight="bold"
      >
        PROYECTOS
      </Typography>

      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            height: rowsEnCurso.length === 0 ? "200px" : "auto",
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
        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          En desarrollo
        </Typography>
        <DataGrid
          getRowHeight={() => 'auto'}
          rows={rowsEnCurso}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          slots={{
            toolbar: CustomToolbar,
            noRowsOverlay: () => CustomNoRowsMessage('No hay proyectos')
          }}
          disableColumnSelector
        />
      </Box>

      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            height: rowsTerminados.length === 0 ? "200px" : "auto",
          },
          "& .MuiDataGrid-columnHeaders": {
            color: colors.primary[100],
            textAlign: "center",
            fontSize: 14,
          },
          "& .MuiDataGrid-toolbarContainer": {
            justifyContent: "flex-end",
            align: "right",
          },
        }}
      >
        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Cerrados
        </Typography>
        <DataGrid
          getRowHeight={() => 'auto'}
          rows={rowsTerminados}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          slots={{
            toolbar: CustomToolbar,
            noRowsOverlay: () => CustomNoRowsMessage('No hay proyectos')
          }}
          disableColumnSelector
        />
      </Box>

    </div>
  );
}