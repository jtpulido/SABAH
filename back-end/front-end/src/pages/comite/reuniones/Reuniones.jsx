import React, { useState, useEffect } from "react";

import { selectToken } from "../../../store/authSlice";
import { useSelector } from "react-redux";
import { useSnackbar } from 'notistack';

import {
  Box, Typography, IconButton, Tooltip, Toolbar, AppBar,
} from '@mui/material';
import CustomDataGrid from "../../layouts/DataGrid";

import { Visibility } from '@mui/icons-material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import VerReunion from "./VerReunion";


export default function Reuniones() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const token = useSelector(selectToken);
  const [rowsPendientes, setRowsPendientes] = useState([]);
  const [rowsCompletadas, setRowsCompletadas] = useState([]);
  const [rowsCanceladas, setRowsCanceladas] = useState([]);

  const { enqueueSnackbar } = useSnackbar();
  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [objetivos, setObjetivos] = useState("");
  const [resultados, setResultados] = useState("");
  const [tareas, setTareas] = useState("");
  const [compromisos, setCompromisos] = useState("");
  const [info, setInfo] = useState("");


  const llenarTablaPendientes = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/comite/obtenerReunionesPendientes`, {
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
      const response = await fetch(`${apiBaseUrl}/comite/obtenerReunionesCompletas`, {
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
      const response = await fetch(`${apiBaseUrl}/comite/obtenerReunionesCanceladas`, {
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
      { field: 'enlace', headerName: 'Enlace/Lugar', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
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
              <IconButton color="secondary" style={{ marginRight: '20px' }} onClick={() => abrirVerReunion(row.id, 'pendiente', row.id_proyecto)}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ]);

  const columnsCompletas = generarColumnas([
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
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Ver Reunión">
              <IconButton color="secondary" style={{ marginRight: '10px' }} onClick={() => abrirVerReunion(row.id, 'completa', row.id_proyecto)}>
                <Visibility />
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
              <IconButton color="secondary" onClick={() => abrirVerReunion(row.id, 'cancelada', row.id_proyecto)}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ]);

  // Ver reunion
  const [abrirVer, setAbrirVer] = useState(false);
  const abrirVerReunion = (id, tipo, id_proyecto) => {
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
        sessionStorage.setItem('comite_id_proyecto', id_proyecto);
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
      const response = await fetch(`${apiBaseUrl}/comite/obtenerInfoActa/${idReunion}`, {
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

  const generarPDF = async (proyecto_id, idReunion) => {
    try {
      const infoproyecto = await fetch(`${apiBaseUrl}/comite/verProyecto/${proyecto_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      const data_proyecto = await infoproyecto.json();
      const infoinvitados = await fetch(`${apiBaseUrl}/comite/obtenerInvitados/${idReunion}`, {
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
      const response = await fetch(`${apiBaseUrl}/comite/generarPDF`, {
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
            REUNIONES
          </Typography>
        </Toolbar>
      </AppBar>

      <VerReunion
        open={abrirVer}
        onSubmit={cerrarReunionVer}
        onClose={cerrarVerReunion}
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