import React, { useState, useEffect } from "react";
import {
  Typography, Box, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Button, AppBar, Toolbar, Link
} from "@mui/material";

import { InsertLink, Upload, Source } from '@mui/icons-material';

import { useSelector } from "react-redux";

import { useSnackbar } from 'notistack';
import CustomDataGrid from "../layouts/DataGrid";
import { selectToken } from "../../store/authSlice";
import "./Entregas.css";
import RealizarEntrega from "./VentanasEntregas/RealizarEntrega";
import VerEntrega from "./VentanasEntregas/VerEntrega";

export default function Entregas() {

  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);

  const [entrega, setEntrega] = useState({});
  const [tipo, setTipo] = useState("");
  const [pendientes, setPendientes] = useState([]);
  const [rowsCalificadas, setRowsCalificadas] = useState([]);
  const [rowsPorCalificar, setRowsPorCalificar] = useState([]);
  const [abrirArtefactos, setAbrirModalArtefactos] = useState(false);
  const [abrirDocumentos, setAbrirModalDocumentos] = useState(false);
  const [link, setLink] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [link_artefacto, setLink_Artefacto] = useState(null);
  const [link_documento, setLink_Documento] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const abrirModalArtefactos = () => {
    setLink(link_artefacto || '')
    setAbrirModalArtefactos(true);
  };

  const cerrarModalLinkArtefacto = () => {
    setAbrirModalArtefactos(false);
    setLink("");
    obtenerlinks();
  };

  const abrirModalDocumentos = () => {
    setLink(link_documento || '')
    setAbrirModalDocumentos(true);
  };

  const cerrarModalLinkDocumento = () => {
    setAbrirModalDocumentos(false);
    setLink("");
    obtenerlinks();
  };

  const guardarLinkArtefacto = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const info = {
        link: link,
        tipol: 'A',
        id: id
      };

      const response = await fetch("http://localhost:5000/proyecto/guardarLink", {
        method: "POST",
        body: JSON.stringify(info),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else {
        mostrarMensaje(data.message, "success");
        cerrarModalLinkArtefacto();
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
    setIsLoading(false);
  };

  const guardarLinkDocumento = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const info = {
        link: link,
        tipol: 'D',
        id: id
      };

      const response = await fetch("http://localhost:5000/proyecto/guardarLink", {
        method: "POST",
        body: JSON.stringify(info),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error");
      } else {
        mostrarMensaje(data.message, "success");
        cerrarModalLinkDocumento();
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
    setIsLoading(false);
  };

  const llenarTabla = async (endpoint, proyecto_id, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/${endpoint}/${proyecto_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setRowsFunc(data.espacios);
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  }
  const obtenerlinks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerLink/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "info")
      } else if (response.status === 200) {
        setLink_Artefacto(data.link_artefacto);
        setLink_Documento(data.link_documento);
      }
    } catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
    }
  }
  const generarColumnas = (inicio, extraColumns) => {
    const columns = [
      { field: 'nombre_espacio_entrega', headerName: 'Nombre', flex: 0.2, minWidth: 150 },
      { field: 'etapa', headerName: 'Etapa', flex: 0.2, minWidth: 150 },
      { field: 'anio', headerName: 'Año', flex: 0.2, minWidth: 150 },
      { field: 'periodo', headerName: 'Periodo', flex: 0.2, minWidth: 150 },
      { field: 'fecha_apertura_entrega', headerName: 'Fecha de apertura entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'fecha_cierre_entrega', headerName: 'Fecha de cierre entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'fecha_apertura_calificacion', headerName: 'Fecha de inicio calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'nombre_rol', headerName: 'Calificador', flex: 0.2, minWidth: 100 }
    ];
    return [...inicio, ...columns, ...extraColumns];
  };

  const columnasPendientes = generarColumnas([
    {
      field: "",
      flex: 0.1,
      minWidth: 50,

      renderCell: ({ row }) => {
        let boton = null;
        if (row.estado_entrega === 'pendiente') {
          boton = (
            <Tooltip title="Realizar Entrega">
              <IconButton color="secondary" onClick={() => abrirDialogAgregarEntrega(row)}>
                <Source />
              </IconButton>
            </Tooltip>
          );
        } else if (row.estado_entrega === 'en_proceso') {
          // Estamos dentro del período de entrega
          boton = (
            <Tooltip title="Realizar Entrega">
              <IconButton color="secondary" onClick={() => abrirDialogAgregarEntrega(row)}>
                <Source />
              </IconButton>
            </Tooltip>
          );
        } else if (row.estado_entrega === 'vencido') {
          // La fecha de cierre ya ha pasado
          boton = (
            <Tooltip title="Ver Entrega">
              <IconButton color="secondary" onClick={() => abrirDialogVerEntrega(row, "vencida")}>
                <Source />
              </IconButton>
            </Tooltip>
          );
        } else if (row.estado_entrega === 'cerrado') {
          // La entrega está cerrada
          boton = (
            <Tooltip title="Ver Entrega">
              <IconButton color="secondary" onClick={() => abrirDialogVerEntrega(row, "cerrada")}>
                <Source />
              </IconButton>
            </Tooltip>
          );
        }

        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            {boton}
          </Box>
        );
      },
    },
  ], [
    { field: 'estado_entrega', headerName: 'Estado', flex: 0.2, minWidth: 100 },
  ]);

  const columnaPorCalificar = generarColumnas([{
    field: "calificar",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Ver Entrega">
            <IconButton color="secondary" onClick={() => abrirDialogVerEntrega(row)}>
              <Source />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  }], [
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },

  ]);

  const columnaCalificadas = generarColumnas([{
    field: "calificado",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Calificar">
            <IconButton color="secondary" onClick={() => abrirDialogVerEntrega(row, "calificado")}>
              <Source />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  }], [
    { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'fecha_evaluacion', headerName: 'Fecha de evaluación', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
    { field: 'nota_final', headerName: 'Nota', flex: 0.1, minWidth: 100 },


  ]);
  const [openVerEntrega, setOpenVerEntrega] = useState(false);

  const abrirDialogVerEntrega = (row, tipo = "") => {
    setEntrega(row)
    setTipo(tipo)
    setOpenVerEntrega(true);
  };

  const cerrarDialogVerEntrega = () => {
    setEntrega({})
    setOpenVerEntrega(false);
  }
  const abrirDialogAgregarEntrega = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const cerrarDialogAgregarEntrega = () => {
    setOpenDialog(false);
  };

  const cerrarEntregaAgregada = () => {
    setPendientes([])
    setRowsCalificadas([])
    llenarTabla("obtenerEntregasPendientes", id, setPendientes);
    llenarTabla("obtenerEntregasCalificadas", id, setRowsCalificadas);
    llenarTabla("obtenerEntregasSinCalificar", id, setRowsPorCalificar);
    setOpenDialog(false);
  };
  useEffect(() => {
    obtenerlinks()
    llenarTabla("obtenerEntregasPendientes", id, setPendientes);
    llenarTabla("obtenerEntregasCalificadas", id, setRowsCalificadas);
    llenarTabla("obtenerEntregasSinCalificar", id, setRowsPorCalificar);
  }, [id]);

  const handleLinkChange = (value) => {
    const isOnlyWhitespace = /^\s*$/.test(value);
    setLink(isOnlyWhitespace ? "" : value);
  };

  const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

  return (
    <div>
      <AppBar position="static" color="transparent" variant="contained" >
        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            ENTREGAS
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ m: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'flex' }}>
          <Box sx={{ border: '1px solid rgba(100, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px', flexGrow: 1, backgroundColor: '#f2f2f2', height: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Link href={link_artefacto} variant="h5" style={{ textAlign: 'center', flex: '1', marginTop: 'auto', marginBottom: 'auto' }} target="_blank">Artefactos De Control</Link>
              <IconButton
                aria-label="Artefactos De Control"
                onClick={abrirModalArtefactos}
                color="secondary"
              >
                <InsertLink />
              </IconButton>
            </div>
          </Box>
          <Box sx={{ border: '1px solid rgba(100, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px', flexGrow: 1, backgroundColor: '#f2f2f2', height: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Link href={link_documento} variant="h5" style={{ textAlign: 'center', flex: '1', marginTop: 'auto', marginBottom: 'auto' }} target="_blank">Documentos del proyecto</Link>

              <IconButton
                aria-label="Documentos del proyecto"
                onClick={abrirModalDocumentos}
                color="secondary"
              >
                <InsertLink />
              </IconButton>

            </div>
          </Box>
        </div >

        <Dialog open={abrirArtefactos} fullWidth maxWidth="xs" onClose={cerrarModalLinkArtefacto}>
          <form onSubmit={guardarLinkArtefacto}>
            <DialogTitle variant="h1" color="primary">
              ARTEFACTOS DE CONTROL
            </DialogTitle>
            <DialogContent dividers >

              <Typography variant="h6" color="primary">
                Link Carpeta Drive
              </Typography>
              <TextField required value={link} onChange={(e) => handleLinkChange(e.target.value)} error={!urlPattern.test(link) && link !== ''}
                helperText={!urlPattern.test(link) && link !== '' ? 'La URL ingresada no es válida.' : ''}
                fullWidth
                multiline
                InputProps={{
                  inputProps: {
                    pattern: urlPattern.source,
                    title: 'Debe ingresar una URL válida que comience con ftp, http o https.',
                  },
                }} />

            </DialogContent>
            <DialogActions>
              <Button onClick={cerrarModalLinkArtefacto} disabled={isLoading}>Cerrar</Button>
              <Button type="submit" variant="contained" disabled={(link === link_documento) || isLoading} startIcon={<Upload />} sx={{
                width: 150,
              }}>
                Guardar
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={abrirDocumentos} fullWidth maxWidth="xs" onClose={cerrarModalLinkDocumento}>
          <form onSubmit={guardarLinkDocumento}>
            <DialogTitle variant="h1" color="primary">
              DOCUMENTOS DEL PROYECTO
            </DialogTitle>
            <DialogContent dividers >

              <Typography variant="h6" color="primary">
                Link Carpeta Drive
              </Typography>
              <TextField required value={link} onChange={(e) => handleLinkChange(e.target.value)} error={!urlPattern.test(link) && link !== ''}
                helperText={!urlPattern.test(link) && link !== '' ? 'La URL ingresada no es válida.' : ''}
                fullWidth
                multiline
                InputProps={{
                  inputProps: {
                    pattern: urlPattern.source,
                    title: 'Debe ingresar una URL válida que comience con ftp, http o https.',
                  },
                }} />

            </DialogContent>
            <DialogActions>
              <Button onClick={cerrarModalLinkDocumento} disabled={isLoading}>Cerrar</Button>
              <Button type="submit" variant="contained" disabled={(link === link_documento) || isLoading} startIcon={<Upload />} sx={{
                width: 150,
              }}>
                Guardar
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <RealizarEntrega
          open={openDialog}
          onClose={cerrarDialogAgregarEntrega}
          onSubmit={cerrarEntregaAgregada}
          entrega={selectedRow || {}}
        />
        <VerEntrega
          open={openVerEntrega}
          onClose={cerrarDialogVerEntrega}
          entrega={entrega}
          tipo={tipo}
        />
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={pendientes} columns={columnasPendientes} mensaje="No hay entregas pendientes" />

        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas sin calificar
        </Typography>
        <CustomDataGrid rows={rowsPorCalificar} columns={columnaPorCalificar} mensaje="No hay entregas sin calificar" />

        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas calificadas
        </Typography>
        <CustomDataGrid rows={rowsCalificadas} columns={columnaCalificadas} mensaje="No hay entregas calificadas" />

      </Box>


    </div >

  );
}
