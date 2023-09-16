import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Typography, Card, CardHeader, CardContent, CardActions, Button, IconButton, AppBar, Toolbar, Box, Paper, Stack, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';
import { ChecklistRtl, Visibility } from "@mui/icons-material";
import CustomDataGrid from "../../layouts/DataGrid";
export default function ProyectosMeritorios() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const verProyecto = (id) => {
    sessionStorage.setItem('id_proyecto', id);
    navigate(`/comite/verProyecto`)
  }
  const token = useSelector(selectToken);
  const [proyectos_meritorios, setProyectosMeritorios] = useState([]);
  const [proyectos_postulados, setProyectosPostulados] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`${apiBaseUrl}/comite/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsFunc(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  };
  const elegirMeritorio = async (row) => {
    try {
      const response = await fetch(`${apiBaseUrl}/comite/proyecto/postulado/meritorio`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postulado: row })
      })
      const data = await response.json();
      if (response.status === 400) {
        mostrarMensaje(data.message, "info");
      } else if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else {
        mostrarMensaje(data.message, "success");
        setProyectosMeritorios([])
        setProyectosPostulados([])
        await llenarTabla("proyecto/postulado/meritorio", setProyectosMeritorios);
        await llenarTabla("proyecto/postulado", setProyectosPostulados);
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }
  useEffect(() => {
    llenarTabla("proyecto/postulado/meritorio", setProyectosMeritorios);
    llenarTabla("proyecto/postulado", setProyectosPostulados);
  }, []);

  const columns = [
    {
      headerName: '',
      field: "id",
      width: 100,
      flex: 0.05, minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center" >
            <Tooltip title="Marcar meritorio">
              <IconButton color="secondary" onClick={() => elegirMeritorio(row)}>
                <ChecklistRtl />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    { field: 'fecha_postulacion', headerName: 'Fecha Postulacion', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, },
    { field: 'anio', headerName: 'Año', flex: 0.05, minWidth: 100, },
    { field: 'periodo', headerName: 'Periodo', flex: 0.05, minWidth: 100, },
    { field: 'nombre', headerName: 'Nombre', flex: 0.4, minWidth: 150, headerAlign: "center" },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, },
    {
      headerName: '',
      field: "id_proyecto",
      width: 100,
      flex: 0.05, minWidth: 50,
      renderCell: ({ row: { id_proyecto } }) => {
        return (
          <Box
            width="100%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
          >
            <Tooltip title="Ver Proyecto">
              <IconButton color="secondary" onClick={() => verProyecto(id_proyecto)}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ];
  const columns_meritorios = [
    { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, },
    { field: 'anio_eleccion', headerName: 'Año', flex: 0.05, minWidth: 100, },
    { field: 'periodo_eleccion', headerName: 'Periodo', flex: 0.05, minWidth: 100, },
    { field: 'nombre', headerName: 'Nombre', flex: 0.4, minWidth: 150, headerAlign: "center" },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, },
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
          > <Tooltip title="Ver Proyecto">
              <IconButton color="secondary" onClick={() => verProyecto(id)}>
                <Visibility />
              </IconButton>
            </Tooltip>
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
            PROYECTOS
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ m: 2 }}>
        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Proyectos postulados
        </Typography>
        <CustomDataGrid rows={proyectos_postulados || []} columns={columns} mensaje="No hay proyectos" />
        <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Proyectos meritorios
        </Typography>
        <CustomDataGrid rows={proyectos_meritorios || []} columns={columns_meritorios} mensaje="No hay proyectos" />
      </Box>
    </div>
  );
}
