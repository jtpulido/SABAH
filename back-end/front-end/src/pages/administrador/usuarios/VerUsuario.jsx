import React, { useState, useEffect, useCallback } from "react";

import { Typography, IconButton, Box, TextField, Grid, CssBaseline, Checkbox, FormControlLabel, AppBar, Toolbar } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import { Visibility } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";


export default function VerUsuario() {

  const id = sessionStorage.getItem('admin_id_usuario');
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const [existe, setExiste] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const [usuario, setUsuario] = useState({
    nombre: '',
    correo: '',
    estado: null
  });

  const [checkboxDirector, setCheckboxDirector] = useState(false);
  const [checkboxLector, setCheckboxLector] = useState(false);
  const [checkboxJurado, setCheckboxJurado] = useState(false);

  const [rowsDirector, setRowsDirector] = useState([]);
  const [rowsLector, setRowsLector] = useState([]);
  const [rowsJurado, setRowsJurado] = useState([]);

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
    navigate(`/admin/verProyecto`);
  }

  const infoUsuario = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/verUsuario/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
        setExiste(false);
      } else {
        setUsuario(data.infoUsuario[0]);
        setExiste(true);
      }
    }
    catch (error) {
      setExiste(false);
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  const rolDirector = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/rolDirector/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        setCheckboxDirector(false);
      } else {
        setCheckboxDirector(true);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  const rolLector = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/rolLector/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        setCheckboxLector(false);
      } else {
        setCheckboxLector(true);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  const rolJurado = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/rolJurado/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        setCheckboxJurado(false);
      } else {
        setCheckboxJurado(true);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  const llenarTablaDirector = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/obtenerProyectosDirector/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else if (data.message === 'No hay proyectos actualmente') {
        setRowsDirector([]);
      } else {
        setRowsDirector(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  const llenarTablaLector = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/obtenerProyectosLector/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else if (data.message === 'No hay proyectos actualmente') {
        setRowsLector([]);
      } else {
        setRowsLector(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  const llenarTablaJurado = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/admin/obtenerProyectosJurado/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else if (data.message === 'No hay proyectos actualmente') {
        setRowsJurado([]);
      } else {
        setRowsJurado(data.proyectos);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  }, [id, token]);

  useEffect(() => {
    rolDirector();
    rolJurado();
    rolLector();
    infoUsuario();
    llenarTablaDirector();
    llenarTablaJurado();
    llenarTablaLector();
  }, [rolDirector, rolJurado, rolLector, infoUsuario, llenarTablaDirector, llenarTablaJurado, llenarTablaLector]);

  const handleModificarUsuario = () => {
    navigate(`/admin/modificarUsuario`)
  };

  return (
    <div >
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar>
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            VER USUARIO
          </Typography>
          <Tooltip title="Modificar Usuario" sx={{ fontSize: '20px' }}>
            <EditIcon color="secondary" sx={{ fontSize: 30, marginRight: "5px", cursor: "pointer" }} onClick={handleModificarUsuario} />
          </Tooltip>
        </Toolbar>
      </AppBar>

      {existe ? (
        <Box sx={{ m: 3 }}>
          <CssBaseline />
          <Box >
            <Typography variant="h3" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
              Información General
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Typography variant="h6" color="primary">
                  Nombre Completo
                </Typography>
                <TextField value={usuario.nombre || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Typography variant="h6" color="primary">
                  Correo Electrónico
                </Typography>
                <TextField value={usuario.correo || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Typography variant="h6" color="primary">
                  Estado
                </Typography>
                <TextField value={(usuario.estado === null ? '' : (usuario.estado ? 'Habilitado' : 'Inhabilitado')) || ''} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6} md={8} lg={6}>
                <Typography variant="h6" color="primary">
                  Roles
                </Typography>
                <FormControlLabel
                  control={<Checkbox checked={checkboxDirector} />}
                  label="Director"
                />
                <FormControlLabel
                  control={<Checkbox checked={checkboxLector} />}
                  label="Lector"
                />
                <FormControlLabel
                  control={<Checkbox checked={checkboxJurado} />}
                  label="Jurado"
                />
              </Grid>
            </Grid>
          </Box>


          <Typography variant="h3" color="secondary"
            sx={{ mt: "30px" }}>
            Proyectos Asociados - Rol Director
          </Typography>
          <CustomDataGrid rows={rowsDirector} columns={columns} mensaje="No hay proyectos" />


          <Typography variant="h3" color="secondary"
            sx={{ mt: "30px" }}>
            Proyectos Asociados - Rol Lector
          </Typography>
          <CustomDataGrid rows={rowsLector} columns={columns} mensaje="No hay proyectos" />

          <Typography variant="h3" color="secondary"
            sx={{ mt: "30px" }}>
            Proyectos Asociados - Rol Jurado
          </Typography>
          <CustomDataGrid rows={rowsJurado} columns={columns} mensaje="No hay proyectos" />
        </Box>
      ) : (
        <Typography variant="h6" color="primary">{mostrarMensaje.mensaje}</Typography>
      )}
    </div>
  );
}