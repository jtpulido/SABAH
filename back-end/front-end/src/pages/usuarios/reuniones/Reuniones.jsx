import React, { useState, useEffect } from "react";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { useSelector } from "react-redux";
import {
  Box, Grid, TextField, FormControl, InputLabel, MenuItem, Select, Typography, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Toolbar, AppBar,
} from '@mui/material';
import { Create, Visibility, AddCircleOutline, Close } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';

import { selectToken } from "../../../store/authSlice";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import CustomDataGrid from "../../layouts/DataGrid";

import CrearReunion from "./Ventanas/CrearReunion";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function CustomDataGridWrapper({ rows, columns }) {
  const [height, setHeight] = useState('300px');

  useEffect(() => {
    setHeight(rows.length > 0 ? 'auto' : '300px');
  }, [rows]);

  return (
    <Box sx={{ height }}>
      <DataGrid
        getRowHeight={() => 'auto'}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        slots={{
          toolbar: CustomToolbar,
          noRowsOverlay: CustomNoRowsMessage
        }}
        disableColumnSelector
      />
    </Box>
  );
}

const CustomNoRowsMessage = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      No hay reuniones
    </div>
  );
};

export default function Reuniones() {

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

  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);

  const [fecha, setFecha] = useState(dayjs());
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [enlace, setEnlace] = useState("");
  const [rol, setRol] = useState("");
  const [reunionSeleccionada, setReunionSeleccionada] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const roles = ['director', 'cliente', 'lector'];
  const [titulo, setTitulo] = useState("");

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const handleRoleChange = (event) => {
    setSelectedRoles(event.target.value);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTitulo("");
    setFecha(null);
    setHora("");
    setNombre("");
    setEnlace("");
    setRol("");
  };

  const handleOpenModal1 = (reunionId) => {
    handleEditarClick(reunionId)

  };

  const handleCloseModal1 = () => {
    setShowModal1(false);
    setTitulo("");
    setFecha(null);
    setHora("");
    setNombre("");
    setEnlace("");
    setRol("");
  };

  const generarColumnas = (extraColumns) => {
    const commonColumns = [
      { field: 'fecha_formateada', headerName: 'Fecha', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'enlace', headerName: 'Link', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'invitados', headerName: 'Invitados', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" }

    ];

    return [...commonColumns, ...extraColumns];
  };

  const llenarTablaPendientes = async () => {
    try {
      const response = await fetch(`http://localhost:5000/usuario/obtenerReunionesPendientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: idUsuario, idRol: idRol }),
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
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
      const response = await fetch(`http://localhost:5000/usuario/obtenerReunionesCompletas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: idUsuario, idRol: idRol }),
      });

      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
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
      const response = await fetch(`http://localhost:5000/usuario/obtenerReunionesCanceladas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: idUsuario, idRol: idRol }),
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsCanceladas(data.canceladas);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
    }
  };

  useEffect(() => {
    llenarTablaPendientes();
    llenarTablaCompletas();
    llenarTablaCanceladas();
  }, []);

  const handleEditarClick = async (reunionId) => {
    try {
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunion/${idUsuario}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}`, 'id_reunion': `${reunionId}` }
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message, 'error');
      } else {
        const formattedReunion = data.reunion.map(row => ({
          ...row,
          fecha: dayjs(row.fecha)
        }));
        await setReunionSeleccionada(formattedReunion);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", 'error');
    }

  };

  const editarReunion = async () => {
    const data = {
      fecha: fecha,
      hora: hora,
      nombre: nombre,
      enlace: enlace,
      invitados: selectedRoles.join(','),
      id_reunion: reunionSeleccionada[0].id,
    };

    const response = await fetch("http://localhost:5000/proyecto/editarReunion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      llenarTablaPendientes();
      mostrarMensaje("La reunion se edito exitosamente.", 'success');
    } else {
      mostrarMensaje("Ocurrió un error.", 'error');
    }
    handleCloseModal1()
  }

  const handleSave = async () => {
    try {
      const data = {
        fecha: fecha,
        hora: hora,
        nombre: nombre,
        enlace: enlace,
        invitados: rol,
        id_proyecto: idUsuario, // IMPORTANTE REVISAR
        id_estado: 1

      };

      const response = await fetch("http://localhost:5000/proyecto/guardarReunion", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });

      if (response.ok) {
        mostrarMensaje("La reunion se genero exitosamente.", 'success');
      } else {
        mostrarMensaje("Ocurrió un error.", 'error');
      }
      handleCloseModal();
      llenarTablaPendientes();
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
    }
  };

  useEffect(() => {
    if (reunionSeleccionada && reunionSeleccionada.length > 0) {
      setNombre(reunionSeleccionada[0].nombre);
      setFecha(reunionSeleccionada[0].fecha);
      setEnlace(reunionSeleccionada[0].enlace);
      setRol(reunionSeleccionada[0].invitados)
      setShowModal1(true);
    }
  }, [reunionSeleccionada]);

  const handleCancelReunion = (row, token) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar la reunión?')) {
      fetch('http://localhost:5000/proyecto/cancelarReunion', {
        method: 'POST',
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: row.id })
      })
        .then(response => {
          if (response.ok) {
            llenarTablaCanceladas();
            mostrarMensaje('La reunión se canceló correctamente', 'success');
          } else {
            mostrarMensaje('Ocurrió un error al cancelar la reunión', 'error');
          }
        })
        .catch(error => {
          mostrarMensaje('Ocurrió un error al cancelar la reunión', 'error');
        });
    }
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
            <Tooltip title="Editar">
              <IconButton color="secondary" style={{ marginRight: '20px' }} onClick={() => handleOpenModal1(row.id)}>
                <Create />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancelar">
              <IconButton color="secondary"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas cancelar la reunión?')) {

                    fetch('http://localhost:5000/proyecto/cancelarReunion', {
                      method: 'POST',
                      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ id: row.id })

                    })

                      .then(response => {
                        if (response.ok) {

                          llenarTablaCanceladas();

                          mostrarMensaje('La reunión se canceló correctamente', 'success');
                        } else {

                          mostrarMensaje('Ocurrió un error al cancelar la reunión', 'error');
                        }
                      })
                      .catch(error => {
                        mostrarMensaje('Ocurrió un error al cancelar la reunión', 'error');

                      });
                  }
                }}>
                <Close />
              </IconButton >
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
        const id = row && row.id;
        const { has_acta } = row;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '35px' }}>
            <Tooltip title="">
              <IconButton color="secondary" component={Link} to={`/user/ActaReunion/${id}`} disabled={has_acta}>
                <DescriptionIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="">
              <IconButton color="secondary" component={Link} to={`/user/ActaReunion/${id}`} disabled={!has_acta}>
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
          </Box >
        );
      },
    },
  ]);

  const { enqueueSnackbar } = useSnackbar();

  const columnsCanceladas = generarColumnas([
    {
      field: "Acción",
      headerName: "Acción",
      flex: 0.01,
      minWidth: 150,
      headerAlign: "center",
      align: "center",
      renderCell: ({ rows }) => {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '35px' }}>
            <Tooltip title="">
              <IconButton color="secondary">
                <Visibility />
              </IconButton>
            </Tooltip>

          </Box>
        );
      },
    },
  ]);

  const [abrirCrear, setAbrirCrear] = useState(false);

  const abrirCrearReunion = () => {
    setAbrirCrear(true);
  };

  const cerrarCrearReunion = () => {
    setAbrirCrear(false);
  }
  const cerrarReunionAgregada = () => {
    setAbrirCrear(false);
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
        onClose={cerrarCrearReunion}
        onSubmit={cerrarReunionAgregada}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>


        <Dialog open={showModal} onClose={handleCloseModal}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <DialogTitle variant="h5">Crear Reunión</DialogTitle>
            <Button onClick={handleCloseModal} startIcon={<Close />} />
          </div>

          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Fecha"
                    value={fecha}
                    onChange={(newValue) => setFecha(newValue)}
                    renderInput={(props) => <input {...props} />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Enlace Reunión"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="rol-label">Rol</InputLabel>
                  <Select
                    labelId="rol-label"
                    id="rol"
                    multiple
                    value={selectedRoles}
                    onChange={handleRoleChange}
                    inputProps={{
                      name: 'rol',
                      id: 'rol',
                    }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center" }}>
            <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontSize: "0.6rem" }}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>


      </div>

      <Box sx={{ m: 3 }}>
        <Box> <Typography variant="h2" color="primary"
          sx={{ mt: "30px" }}>
          Pendientes
        </Typography>
          <CustomDataGrid rows={rowsPendientes} columns={columnsPendientes} mensaje="No hay reuniones" />

          <Dialog open={showModal1} onClose={handleCloseModal1}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <DialogTitle variant="h5">Editar Reunión</DialogTitle>
              <Button onClick={handleCloseModal1} startIcon={<Close />} />
            </div>

            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Fecha"
                      value={fecha}
                      onChange={(newValue) => setFecha(newValue)}
                      renderInput={(props) => <input {...props} />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Enlace Reunión"
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Invitado"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center" }}>
              <Button onClick={editarReunion} variant="contained" color="primary" sx={{ fontSize: "0.6rem" }}>
                Guardar
              </Button>
            </DialogActions>
          </Dialog>

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

    </div>
  );
}