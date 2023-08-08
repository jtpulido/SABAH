import React, { useState, useEffect } from "react";
import {
  Typography, Box, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Button, AppBar, Toolbar, Link
} from "@mui/material";

import { PostAdd, InsertLink, HighlightOff, Upload, Source } from '@mui/icons-material';

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
  };

  const abrirModalDocumentos = () => {
    setLink(link_documento || '')
    setAbrirModalDocumentos(true);
  };

  const cerrarModalLinkDocumento = () => {
    setAbrirModalDocumentos(false);
    setLink("");
  };



  const guardarLinkArtefacto = async () => {
    try {
      const data = {
        link: link,
        tipol: 'A',
        id: id
      };

      const response = await fetch("http://localhost:5000/proyecto/guardarLink", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });

      if (response.ok) {
        mostrarMensaje("La solicitud se genero exitosamente.", "success");
      } else {
        mostrarMensaje("Ocurrió un error.", "error");
      }
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
    }
    cerrarModalLinkArtefacto();
  };

  const guardarLinkDocumento = async () => {

    try {


      const data = {
        link: link,
        tipol: 'D',
        id: id
      };

      const response = await fetch("http://localhost:5000/proyecto/guardarLink", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      if (response.ok) {
        mostrarMensaje("La solicitud se genero exitosamente.", "success");
      } else {
        mostrarMensaje("Ocurrió un error.", "error");
      }
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
    }
    cerrarModalLinkDocumento();
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
        mostrarMensaje(data.message, "warning")
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
        mostrarMensaje(data.message, "warning")
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
      { field: 'descripcion', headerName: 'Descripción', flex: 0.3, minWidth: 150 },
      { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.15, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.15, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'nombre_rol', headerName: 'Calificador', flex: 0.2, minWidth: 100 }
    ];
    return [...inicio, ...columns, ...extraColumns];
  };

  const columnasPendientes = generarColumnas([
    {
      field: "Acción",
      flex: 0.1,
      minWidth: 50,


      renderCell: ({ row }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Tooltip title="Añadir entrega">
              <IconButton color="secondary" onClick={() => abrirDialogAgregarEntrega(row)}>
                <PostAdd />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], []);

  const columnaPorCalificar = generarColumnas([{
    field: "calificar",
    headerName: "",
    flex: 0.1,
    minWidth: 50,
    renderCell: ({ row }) => {
      return (
        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
          <Tooltip title="Calificar">
            <IconButton color="secondary" onClick={() => abrirDialogCalificar(row)}>
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
            <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "calificado")}>
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
  const [openCalificar, setOpenCalificar] = useState(false);

  const abrirDialogCalificar = (row, tipo = "") => {
    setEntrega(row)
    setTipo(tipo)
    setOpenCalificar(true);
  };

  const cerrarDialogCalificar = () => {
    setEntrega({})
    setOpenCalificar(false);
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
  }
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
        <Dialog open={abrirArtefactos} maxWidth="md" onClose={cerrarModalLinkArtefacto}>
          <DialogTitle variant='h3' color="primary" >
            Artefactos de control
            <IconButton onClick={cerrarModalLinkArtefacto} color="secondary" >
              <HighlightOff />
            </IconButton>
          </DialogTitle>
          <form onSubmit={guardarLinkArtefacto}>
            <DialogContent>
              <TextField
                label="Link carpeta drive" required value={link} onChange={(e) => handleLinkChange(e.target.value)}
                error={!urlPattern.test(link) && link !== ''}
                helperText={!urlPattern.test(link) && link !== '' ? 'La URL ingresada no es válida.' : ''}
                fullWidth
                multiline
                InputProps={{
                  inputProps: {
                    pattern: urlPattern.source,
                    title: 'Debe ingresar una URL válida que comience con ftp, http o https.',
                  },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button type="submit" variant="contained" startIcon={<Upload />} sx={{ width: 150, }} disabled={link === link_artefacto}>
                Guardar
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog open={abrirDocumentos} maxWidth="md" onClose={cerrarModalLinkDocumento}>
          <DialogTitle variant='h3' color="primary">
            Documentos del proyecto
            <IconButton onClick={cerrarModalLinkDocumento} color="secondary" >
              <HighlightOff />
            </IconButton>
          </DialogTitle>
          <form onSubmit={guardarLinkDocumento}>
            <DialogContent>
              <TextField label="Link carpeta drive" required value={link} onChange={(e) => handleLinkChange(e.target.value)} error={!urlPattern.test(link) && link !== ''}
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
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button type="submit" variant="contained" startIcon={<Upload />} sx={{ width: 150, }} disabled={link === link_documento}>
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
          open={openCalificar}
          onClose={cerrarDialogCalificar}
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
