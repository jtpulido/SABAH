import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Toolbar, AppBar } from "@mui/material";

import { Visibility } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CustomDataGrid from "../../layouts/DataGrid";

export default function Sustentaciones() {
  const navigate = useNavigate();

  const verProyecto = (id) => {
    sessionStorage.setItem('id_proyecto', id);
    navigate(`/comite/verProyecto`)
  }
  const token = useSelector(selectToken);
  const [fechas_sustentaciones, setFechasSustentaciones] = useState([]);

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
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsFunc(data.sustentacion);
      }
    }
    catch (error) {
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  };

  useEffect(() => {
    llenarTabla("sustentacion", setFechasSustentaciones);
  }, []);
  const columns = [
    { field: 'fecha_sustentacion', headerName: 'Fecha Sustentación', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'lugar_sustentacion', headerName: 'Lugar Sustentación', flex: 0.2, minWidth: 150, },
    { field: 'nombre', headerName: 'Nombre', flex: 0.4, minWidth: 150, headerAlign: "center" },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, },
    { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, },
    { field: 'anio', headerName: 'Año', flex: 0.05, minWidth: 100, },
    { field: 'periodo', headerName: 'Periodo', flex: 0.05, minWidth: 100, },
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
  return (
    <div>
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            SUSTENTACIONES DE PROYECTOS
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ m: 2 }}>
        <CustomDataGrid rows={fechas_sustentaciones || []} columns={columns} mensaje="No se han programado sustentaciones." />
      </Box>
    </div>

  );
}