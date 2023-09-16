import React, { useState, useEffect } from "react";

import { selectToken } from "../../../store/authSlice";
import { useSelector } from "react-redux";

import {
  Box, Typography, Button, IconButton, Tooltip, Toolbar, AppBar,
} from '@mui/material';
import { Create, Visibility, AddCircleOutline, Close } from '@mui/icons-material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { useSnackbar } from 'notistack';
import CustomDataGrid from "../../layouts/DataGrid";

import CrearReunion from "./Ventanas/CrearReunion";
import CancelarReunion from "./Ventanas/CancelarReunion";
import EditarReunion from "./Ventanas/EditarReunion";
import VerReunion from "./Ventanas/VerReunion";


export default function Reuniones() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const idUsuario = sessionStorage.getItem('user_id_usuario');
  const idRol = sessionStorage.getItem('id_rol');

  let nombreRol = '';
  if (idRol === '1') {
    nombreRol = 'DIRECTOR';
  } else if (idRol === '2') {
    nombreRol = 'LECTOR';
  } else if (idRol === '3') {
    nombreRol = 'JURADO';
  }

  const token = useSelector(selectToken);

  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsCompletadas, setRowsCompletadas] = useState([]);
  const [rowsCanceladas, setRowsCanceladas] = useState([]);

  const [objetivos, setObjetivos] = useState("");
  const [resultados, setResultados] = useState("");
  const [tareas, setTareas] = useState("");
  const [compromisos, setCompromisos] = useState("");
  const [info, setInfo] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const llenarTablaPendientes = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/usuario/obtenerReunionesPendientes/${idUsuario}/${idRol}`, {
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
      const response = await fetch(`${apiBaseUrl}/usuario/obtenerReunionesCompletas/${idUsuario}/${idRol}`, {
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
      const response = await fetch(`${apiBaseUrl}/usuario/obtenerReunionesCanceladas/${idUsuario}/${idRol}`, {
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
      { field: 'nombre_proyecto', headerName: 'Proyecto', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" }
    ];
    return [...commonColumns, ...extraColumns];
  };

  const generarColumnasCompletas = (extraColumns) => {
    const commonColumns = [
      { field: 'fecha', headerName: 'Fecha y Hora', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'nombre_proyecto', headerName: 'Proyecto', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'nombre_asistencia', headerName: 'Asistencia', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" }
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
              <IconButton color="secondary" style={{ marginRight: '20px' }} onClick={() => abrirEditarReunion(row.id, 'pendiente')}>
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

  const columnsCompletas = generarColumnasCompletas([
    {
      field: "Acción",
      headerName: "Acción",
      flex: 0.01,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const idActa = row && row.id_acta;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '35px' }}>
            <Tooltip title="Ver Reunión">
              <IconButton color="secondary" style={{ marginRight: '10px' }} onClick={() => abrirVerReunion(row.id, 'completa')}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar Reunión">
              <IconButton color="secondary" style={{ marginRight: '10px' }} onClick={() => abrirEditarReunion(row.id, 'completa')}>
                <Create />
              </IconButton>
            </Tooltip>
            <Tooltip title="Descargar Acta de Reunión">
              <IconButton color="secondary" onClick={() => abrirActa(row.id, row.id_proyecto)} disabled={idActa === null || isLoading}>
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
  };
  const cerrarReunionAgregada = () => {
    llenarTablaPendientes();
  };

  // Cancelar reunion
  const [abrirCancelar, setAbrirCancelar] = useState(false);
  const abrirCancelarReunion = (id) => {
    sessionStorage.setItem('usuario_id_reunion', id);
    setAbrirCancelar(true);
  };
  const cerrarCancelarReunion = () => {

    setAbrirCancelar(false);
  };
  const cerrarReunionCancelada = () => {
    setRowsPendientes([])
    setRowsCanceladas([])
    llenarTablaPendientes();
    llenarTablaCanceladas();
    setAbrirCancelar(false);
  };

  // Editar reunion
  const [abrirEditar, setAbrirEditar] = useState(false);
  const abrirEditarReunion = (id, tipo) => {

    let registroEncontrado;
    if (tipo === 'pendiente' && rowsPendientes.length > 0) {
      registroEncontrado = rowsPendientes.find(reunion => reunion.id === id);
    } else if (tipo === 'completa' && rowsCompletadas.length > 0) {
      registroEncontrado = rowsCompletadas.find(reunion => reunion.id === id);
    }

    if (registroEncontrado) {
      try {
        const reunionCadena = JSON.stringify(registroEncontrado);
        sessionStorage.setItem('usuario_reunion_editar', reunionCadena);
        sessionStorage.setItem('usuario_id_reunion', id);
        setAbrirEditar(true);
      } catch (error) {
        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
      }
    } else {
      mostrarMensaje("No se encontró la reunión con el ID proporcionado.", "error");
    }
  };
  const cerrarEditarReunion = () => {
    setAbrirEditar(false);
  };
  const cerrarReunionEditada = () => {
    llenarTablaPendientes();
    llenarTablaCompletas();
    setAbrirEditar(false);
  };

  // Ver reunion
  const [abrirVer, setAbrirVer] = useState(false);
  const abrirVerReunion = (id, tipo) => {
    let registroEncontrado;
    if (tipo === 'pendiente' && rowsPendientes.length > 0) {
      registroEncontrado = rowsPendientes.find(reunion => reunion.id === id);
    } else if (tipo === 'cancelada' && rowsCanceladas.length > 0) {
      registroEncontrado = rowsCanceladas.find(reunion => reunion.id === id);
    } else if (tipo === 'completa' && rowsCompletadas.length > 0) {
      registroEncontrado = rowsCompletadas.find(reunion => reunion.id === id);
    }

    if (registroEncontrado) {
      try {
        const reunionCadena = JSON.stringify(registroEncontrado);
        sessionStorage.setItem('usuario_reunion_ver', reunionCadena);
        sessionStorage.setItem('usuario_id_reunion', id);
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
  };
  const cerrarReunionVer = () => {
    llenarTablaPendientes();
  };

  // Acta de Reunion
  const abrirActa = async (id, id_proyecto) => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        traerInfo(id)
      ]);
      await generarPDF(id_proyecto, id);
    } finally {
      setIsLoading(false);
    }
  };

  const traerInfo = async (idReunion) => {
    try {
      const response = await fetch(`${apiBaseUrl}/usuario/obtenerInfoActa/${idReunion}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });

      const data = await response.json();
      if (data.success) {
        setInfo(data.acta);
        setObjetivos(data.acta.descrip_obj);
        setResultados(data.acta.resultados_reu);
        setTareas(data.acta.tareas_ant);
        setCompromisos(data.acta.compromisos);
      }

    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  const generarPDF = async (id, idReunion) => {
    try {
      const infoproyecto = await fetch(`${apiBaseUrl}/usuario/obtenerProyecto/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      const data_proyecto = await infoproyecto.json();
      const infoinvitados = await fetch(`${apiBaseUrl}/usuario/obtenerInvitados/${idReunion}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      const data_invitados = await infoinvitados.json();
      const data = {
        fecha: info.fecha,
        compromisos: compromisos,
        objetivos: objetivos,
        tareas: tareas,
        nombre: info.nombre,
        resultados: resultados,
        data_proyecto,
        data_invitados
      };
      const response = await fetch(`${apiBaseUrl}/usuario/generarPDF`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const blob = await response.blob();
      const fileName = `${data.nombre}.pdf`;
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);

      downloadLink.click();

      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

    } catch (error) {
      mostrarMensaje("Ha ocurrido un error al generar el PDF. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  return (
    <div >
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            REUNIONES ASOCIADOS AL ROL {nombreRol}
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