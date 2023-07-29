import React, { useState, useEffect } from "react";
import {
  Typography, Box, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Button, AppBar, Toolbar
} from "@mui/material";

import { PostAdd, InsertLink, HighlightOff, Upload } from '@mui/icons-material';

import { useSelector } from "react-redux";

import { useSnackbar } from 'notistack';
import CustomDataGrid from "../layouts/DataGrid";
import RealizarEntrega from "./RealizarEntrega";
import { selectToken } from "../../store/authSlice";
import "./Entregas.css";

export default function Entregas() {

  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [link, setLink] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setLink("");
  };

  const handleOpenModal1 = () => {
    setShowModal1(true);
  };

  const handleCloseModal1 = () => {
    setShowModal1(false);
    setLink("");
  };



  const handleSave = async () => {
    try {
      const data = {
        link: link,
        tipol: 'A',
        id: id
      };

      // Realiza la solicitud POST al backend
      const response = await fetch("http://localhost:5000/proyecto/guardarLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });

      if (response.ok) {
        mostrarMensaje("La solicitud se genero exitosamente.", "success");
      } else {
        mostrarMensaje("Ocurrió un error.", "error");
      }
      handleCloseModal()
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
    }
    handleCloseModal();
  };
  const handleSaveProyecto = async () => {

    try {
      const data = {
        link: link,
        tipol: 'D',
        id: id
      };

      const response = await fetch("http://localhost:5000/proyecto/guardarLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
      if (response.ok) {
        mostrarMensaje("La solicitud se genero exitosamente.", "success");
      } else {
        mostrarMensaje("Ocurrió un error.", "error");
      }
      handleCloseModal()
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
    }
    handleCloseModal();
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
  const generarColumnas = (extraColumns) => {
    const columns = [
      { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150 },
      { field: 'descripcion', headerName: 'Descripción', flex: 0.3, minWidth: 150 },
      { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.15, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.15, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
      { field: 'nombre_rol', headerName: 'Calificador', flex: 0.2, minWidth: 100 }
    ];
    return [...columns, ...extraColumns];
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
  ]);

  const columnas = generarColumnas([
    { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.15, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
  ]);

  const abrirDialogAgregarEntrega = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const cerrarDialogAgregarEntrega = () => {
    setOpenDialog(false);
  };

  const cerrarEntregaAgregada = () => {
    setPendientes([])
    setCompletadas([])
    llenarTabla("obtenerEntregasPendientes", id, setPendientes);
    llenarTabla("obtenerEntregasCompletadas", id, setCompletadas);
    setOpenDialog(false);
  };
  useEffect(() => {
    llenarTabla("obtenerEntregasPendientes", id, setPendientes);
    llenarTabla("obtenerEntregasCompletadas", id, setCompletadas);
  }, [id]);

  const handleLinkChange = (value) => {
    const isOnlyWhitespace = /^\s*$/.test(value);
    setLink(isOnlyWhitespace ? "" : value);
  };
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
        <div style={{ display: 'flex', justifyContent: 'flex'}}>
          <Box sx={{ border: '1px solid rgba(100, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px', flexGrow: 1, backgroundColor: '#f2f2f2', height: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Typography variant="h5" style={{ textAlign: 'center', flex: '1', marginTop: 'auto', marginBottom: 'auto' }}>Artefactos De Control</Typography>

              <IconButton
                aria-label="Artefactos De Control"
                onClick={handleOpenModal}
                color="secondary"
              >
                <InsertLink />
              </IconButton>
            </div>
          </Box>
          <Box sx={{ border: '1px solid rgba(100, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px', flexGrow: 1, backgroundColor: '#f2f2f2', height: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <Typography variant="h5" style={{ textAlign: 'center', flex: '1', marginTop: 'auto', marginBottom: 'auto' }}>Documentos Del Proyecto</Typography>

              <IconButton
                aria-label="Documentos del proyecto"
                onClick={handleOpenModal1}
                color="secondary"
              >
                <InsertLink />
              </IconButton>

            </div>
          </Box>
        </div >
        <Dialog open={showModal} onClose={handleCloseModal}>
          <DialogTitle variant='h3' color="primary">
            Artefactos de control
            <IconButton onClick={handleCloseModal} color="secondary" >
              <HighlightOff />
            </IconButton>
          </DialogTitle>
          <form onSubmit={handleSave}>
            <DialogContent>
              <TextField label="Link carpeta drive" required value={link} onChange={(e) => handleLinkChange(e.target.value)} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button type="submit" variant="contained" startIcon={<Upload />} sx={{
                width: 150,
              }}>
                Guardar
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog open={showModal1} onClose={handleCloseModal1}>
          <DialogTitle variant='h3' color="primary">
            Documentos del proyecto
            <IconButton onClick={handleCloseModal1} color="secondary" >
              <HighlightOff />
            </IconButton>
          </DialogTitle>
          <form onSubmit={handleSaveProyecto}>
            <DialogContent>
              <TextField label="Link carpeta drive" required value={link} onChange={(e) => handleLinkChange(e.target.value)} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
              <Button type="submit" variant="contained" startIcon={<Upload />} sx={{
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
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas pendientes
        </Typography>
        <CustomDataGrid rows={pendientes} columns={columnasPendientes} mensaje="No hay entregas pendientes" />

        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Entregas realizadas
        </Typography>
        <CustomDataGrid rows={completadas} columns={columnas} mensaje="No hay entregas realizadas" />

      </Box>


    </div >

  );
}
