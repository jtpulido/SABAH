import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, IconButton } from "@mui/material";

import { Visibility } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CustomDataGrid from "../../layouts/DataGrid";

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
            <IconButton aria-label="fingerprint" color="secondary" onClick={() => verProyecto(id)}>
              <Visibility />
            </IconButton>
          </Box>
        );
      },
    }
  ];
  const verProyecto = (id) => {
    navigate(`/comite/verProyecto/${id}`)
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

  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message,"warning")
      } else if (response.status === 200) {
        setRowsFunc(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  };

  useEffect(() => {
    llenarTabla("obtenerTerminados", setRowsTerminados);
    llenarTabla("obtenerEnCurso", setRowsEnCurso);
  }, []);
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
        <CustomDataGrid rows={rowsEnCurso || []} columns={columns} mensaje="No hay proyectos" />

        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Cerrados
        </Typography>
        <CustomDataGrid rows={rowsTerminados || []} columns={columns} mensaje="No hay proyectos" />

      </Box>

    </div>
  );
}