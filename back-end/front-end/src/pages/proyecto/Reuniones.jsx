import React, { useState, useEffect } from "react";

import { selectToken } from "../../store/authSlice";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useSnackbar } from 'notistack';

import {
  Box, Typography, Button, IconButton, Tooltip, Toolbar, AppBar,
} from '@mui/material';
import CustomDataGrid from "../layouts/DataGrid";

import { Create, Visibility, AddCircleOutline, Close } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import CrearReunion from "./VentanasReuniones/CrearReunion";
import CancelarReunion from "./VentanasReuniones/CancelarReunion";
import EditarReunion from "./VentanasReuniones/EditarReunion";
import VerReunion from "./VentanasReuniones/VerReunion";


export default function Reuniones() {

  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);
  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsCompletadas, setRowsCompletadas] = useState([]);
  const [rowsCanceladas, setRowsCanceladas] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const navigate = useNavigate();

  const llenarTablaPendientes = async () => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesPendientes/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else {
        setRowsPendientes(data.pendientes);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  const llenarTablaCompletas = async () => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesCompletas/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setRowsCompletadas(data.completas);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  const llenarTablaCanceladas = async () => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesCanceladas/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setRowsCanceladas(data.canceladas);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  useEffect(() => {
    llenarTablaPendientes()
    llenarTablaCompletas()
    llenarTablaCanceladas()
  }, []);

  const generarColumnas = (extraColumns) => {
    const commonColumns = [
      { field: 'fecha', headerName: 'Fecha y Hora', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'enlace', headerName: 'Link', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'roles_invitados', headerName: 'Invitados', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" }
    ];
    return [...commonColumns, ...extraColumns];
  };

  const columnsPendientes = generarColumnas([
    {
      field: "Acción",
      headerName: "Acción",
      flex: 0.01,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Ver Reunión">
              <IconButton color="secondary" style={{ marginRight: '20px' }} onClick={() => abrirVerReunion(row.id, 'pendiente')}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar Reunión">
              <IconButton color="secondary" style={{ marginRight: '20px' }} onClick={() => abrirEditarReunion(row.id)}>
                <Create />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancelar Reunión">
              <IconButton color="secondary"
                onClick={() => abrirCancelarReunion(row.id)}>
                <Close />
              </IconButton >
            </Tooltip>
          </Box>
        );
      },
    },
  ]);

  const has_acta = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerInfoActa/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        return false 
      } else {
        return true
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };
  const columnsCompletas = generarColumnas([
    {
      field: "Acción",
      headerName: "Acción",
      flex: 0.01,
      minWidth: 150,
      headerAlign: "center",
      align: "center",  
      renderCell: ({ row }) => {
        const id = row && row.id;
        const { has }= has_acta(row.id);
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '35px' }}>
            <Tooltip title="Ver Reunión">
              <IconButton color="secondary" style={{ marginRight: '10px' }} onClick={() => abrirVerReunion(row.id, 'completa')}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Crear Acta de Reunión">
              <IconButton color="secondary" component={Link} to={`/proyecto/ActaReunion/${id}`} disabled={has}>
                <DescriptionIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Descargar Acta de Reunión">
              <IconButton color="secondary" component={Link} to={`/proyecto/ActaReunion/${id}`} disabled={!has}>
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
          </Box >
        );
      },
    },
  ]);

  const columnsCanceladas = generarColumnas([
    {
      field: "Acción",
      headerName: "Acción",
      flex: 0.01,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '35px' }}>
            <Tooltip title="">
              <IconButton color="secondary" onClick={() => abrirVerReunion(row.id, 'cancelada')}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ]);

  // Crear reunion
  const [abrirCrear, setAbrirCrear] = useState(false);
  const abrirCrearReunion = () => {
    setAbrirCrear(true);
  };

  const cerrarCrearReunion = () => {
    llenarTablaPendientes();
    setAbrirCrear(false);
  }
  const cerrarReunionAgregada = () => {
    llenarTablaPendientes();
  };

  // Cancelar reunion
  const [abrirCancelar, setAbrirCancelar] = useState(false);
  const abrirCancelarReunion = (id) => {
    sessionStorage.setItem('proyecto_id_reunion', id);
    setAbrirCancelar(true);
  };

  const cerrarCancelarReunion = () => {
    llenarTablaPendientes();
    llenarTablaCanceladas();
    setAbrirCancelar(false);
  }
  const cerrarReunionCancelada = () => {
    llenarTablaPendientes();
    llenarTablaCanceladas();
  };

  // Editar reunion
  const [abrirEditar, setAbrirEditar] = useState(false);
  const abrirEditarReunion = (id) => {
    const registroEncontrado = rowsPendientes.find(reunion => reunion.id === id);
    const reunionCadena = JSON.stringify(registroEncontrado);
    sessionStorage.setItem('info_reunion_editar', reunionCadena);
    sessionStorage.setItem('proyecto_id_reunion', id);
    setAbrirEditar(true);
  };

  const cerrarEditarReunion = () => {
    llenarTablaPendientes();
    setAbrirEditar(false);
  }
  const cerrarReunionEditada = () => {
    llenarTablaPendientes();
  };

  // Ver reunion
  const [abrirVer, setAbrirVer] = useState(false);
  const abrirVerReunion = (id, tipo) => {
    let registroEncontrado;
    if (tipo === 'pendiente') {
      registroEncontrado = rowsPendientes.find(reunion => reunion.id === id);
    } else if (tipo === 'cancelada') {
      registroEncontrado = rowsCanceladas.find(reunion => reunion.id === id);
    } else if (tipo === 'completa') {
      registroEncontrado = rowsCompletadas.find(reunion => reunion.id === id);
    }

    if (registroEncontrado) {
      try {
        const reunionCadena = JSON.stringify(registroEncontrado);
        sessionStorage.setItem('info_reunion_ver', reunionCadena);
        sessionStorage.setItem('proyecto_id_reunion', id);
        setAbrirVer(true);
      } catch (error) {
        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
      }
    } else {
      mostrarMensaje("No se encontró la reunión con el ID proporcionado.", "error");
    }
  };

  const cerrarVerReunion = () => {
    llenarTablaPendientes();
    setAbrirVer(false);
  }
  const cerrarReunionVer = () => {
    llenarTablaPendientes();
  };

  // Acta de Reunion
  const abrirActa = (id) => {
    sessionStorage.setItem('proyecto_id_reunion', id);
    navigate('/proyecto/ActaReunion');
  };

  return (
    <div >
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            REUNIONES
          </Typography>
          <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirCrearReunion} sx={{ width: 150 }}>
            Crear Reunión
          </Button>
        </Toolbar>
      </AppBar>

      <CrearReunion
        open={abrirCrear}
        onSubmit={cerrarReunionAgregada}
        onClose={cerrarCrearReunion}
      />
      <VerReunion
        open={abrirVer}
        onSubmit={cerrarReunionVer}
        onClose={cerrarVerReunion}
      />
      <CancelarReunion
        open={abrirCancelar}
        onSubmit={cerrarReunionCancelada}
        onClose={cerrarCancelarReunion}
      />
      <EditarReunion
        open={abrirEditar}
        onSubmit={cerrarReunionEditada}
        onClose={cerrarEditarReunion}
      />

      <Box sx={{ m: 3 }}>
        <Box> <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Pendientes
        </Typography>
          <CustomDataGrid rows={rowsPendientes} columns={columnsPendientes} mensaje="No hay reuniones" />
        </Box>

        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Completas
        </Typography>
        <CustomDataGrid rows={rowsCompletadas} columns={columnsCompletas} mensaje="No hay reuniones" />

        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Canceladas
        </Typography>
        <CustomDataGrid rows={rowsCanceladas} columns={columnsCanceladas} mensaje="No hay reuniones" />
      </Box>
    </div >
  );
}