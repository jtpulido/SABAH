import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Toolbar, AppBar } from "@mui/material";

import { Visibility } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CustomDataGrid from "../../layouts/DataGrid";

export default function Proyectos() {
  const navigate = useNavigate();
  const columns = [
    {
      field: 'nombre', headerName: 'Nombre', flex: 0.4, minWidth: 150,
      headerAlign: "center"
    },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, },
    { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, },
    { field: 'anio', headerName: 'Año', flex: 0.05, minWidth: 100, },
    { field: 'periodo', headerName: 'Periodo', flex: 0.05, minWidth: 100, },
    { field: 'etapa', headerName: 'Etapa', flex: 0.15, minWidth: 100, },
    { field: 'estado', headerName: 'Estado', flex: 0.1, minWidth: 100, },
    {
      headerName: '',
      field: "id",
      width: 100,
      flex: 0.05, minWidth: 50,
      renderCell: ({ row: { id } }) => {
        return (
          <Box
            width="100%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
          >
            <IconButton color="secondary" onClick={() => verProyecto(id)}>
              <Visibility />
            </IconButton>
          </Box>
        );
      },
    }
  ];
  const verProyecto = (id) => {
    sessionStorage.setItem('admin_id_proyecto', id);
    navigate(`/admin/verProyecto`)
}
  const token = useSelector(selectToken);
  const [rowsEnCurso, setRowsEnCurso] = useState([]);
  const [rowsTerminados, setRowsTerminados] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setRowsFunc(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  };

  useEffect(() => {
    llenarTabla("obtenerTerminados", setRowsTerminados);
    llenarTabla("obtenerEnCurso", setRowsEnCurso);
  }, []);

  return (
    <div>
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            PROYECTOS
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ m: 2 }}>
        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          En desarrollo
        </Typography>
        <CustomDataGrid rows={rowsEnCurso || []} columns={columns} mensaje="No hay proyectos" />

        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Cerrados
        </Typography>
        <CustomDataGrid rows={rowsTerminados || []} columns={columns} mensaje="No hay proyectos" />

      </Box>
    </div>

  );
}