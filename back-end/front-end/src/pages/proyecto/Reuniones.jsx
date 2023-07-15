import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Box, CssBaseline, TextField, Grid } from '@mui/material';
import { Typography, useTheme, Alert, Snackbar} from "@mui/material";
import "./InicioPro.css";
import {  Button, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import CreateIcon from '@mui/icons-material/Create';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Link } from 'react-router-dom';


function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
function CustomDataGrid({ rows, columns }) {
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

  const navigate = useNavigate();
  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [canceladas, setCanceladas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(dayjs());
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [enlace, setEnlace] = useState("");
  const [rol, setRol] = useState("");
  const [idReunion, setIdReunion] = useState("");
  const [reunionSeleccionada, setReunionSeleccionada] = useState(null);


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

  const handleEditarClick = async (reunionId) => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunion/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` , 'id_reunion':`${reunionId}`}
      });
      const data = await response.json();
      
      if (!data.success) {
        setError(data.message);
      } else {
        const formattedReunion = data.reunion.map(row => ({
          ...row,
          fecha: dayjs(row.fecha)
        }));
        await setReunionSeleccionada(formattedReunion);
      }
    }
    catch (error) {
      alert(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
    
  };

  const editarReunion = async () => {
    
    const data = {
      fecha: fecha,
      hora: hora,
      nombre: nombre,
      enlace: enlace,
      invitados: rol,
      id_reunion: reunionSeleccionada[0].id, // Convertir a número entero
    };
  
    
    // Realiza la solicitud POST al backend
    const response = await fetch("http://localhost:5000/proyecto/editarReunion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    

    // Verifica si la solicitud fue exitosa
    if (response.ok) {
      alert("La reunion se edito exitosamente.");
    } else {
      alert("Ocurrió un error.");
    }
    handleCloseModal1()
  }

  const handleSave = async () => {
    try {
      // Crea un objeto con los datos que deseas enviar al backend
      const data = {
        fecha: fecha,
        hora: hora,
        nombre: nombre,
        enlace: enlace,
        invitados: rol,
        id_proyecto:id,
        id_estado: 1
        
      };
  
      // Realiza la solicitud POST al backend
      const response = await fetch("http://localhost:5000/proyecto/guardarReunion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
  
      // Verifica si la solicitud fue exitosa
      if (response.ok) {
        alert("La reunion se genero exitosamente.");
      } else {
        alert("Ocurrió un error.");
      }
      handleCloseModal()
    } catch (error) {
      console.error("Ocurrió un error al realizar la solicitud al backend:", error);
    }
  };
  const generarColumnas = (extraColumns) => {

    const commonColumns = [
      {
        field: 'fecha',
        headerName: 'Fecha',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
      },
      {
        field: 'nombre',
        headerName: 'Nombre',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
      },
      
    ];

    return [...commonColumns, ...extraColumns];
  }
  const llenarTablaPendientes = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesPendientes/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      } else {
        const formattedPendientes = data.pendientes.map(row => ({
          ...row,
          fecha: new Date(row.fecha).toLocaleDateString()
        }));
        setPendientes(formattedPendientes);
      }
    }
    catch (error) {
      
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
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
        setError(data.message);
      } else {
        const formattedCompletadas = data.completas.map(row => ({
          ...row,
          fecha: new Date(row.fecha).toLocaleDateString()
        }));
        setCompletadas(formattedCompletadas);
      }
    }
    catch (error) {
      alert(error);
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
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
        setError(data.message);
      } else {
        const formattedCanceladas = data.canceladas.map(row => ({
          ...row,
          fecha: new Date(row.fecha).toLocaleDateString()
        }));
        setCanceladas(formattedCanceladas);
      }
    }
    catch (error) {
      alert(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  useEffect(() => {
    llenarTablaPendientes();
    llenarTablaCompletas();
    llenarTablaCanceladas();
    if (reunionSeleccionada && reunionSeleccionada.length > 0) {
      alert("reunion seleccionada", reunionSeleccionada);
      setNombre(reunionSeleccionada[0].nombre);
      setFecha(reunionSeleccionada[0].fecha);
      setEnlace(reunionSeleccionada[0].enlace);
      setRol(reunionSeleccionada[0].invitados)
      setShowModal1(true);
      // navigate(`/proyecto/VerReunion?${urlParams.toString()}`);
    }
  }, [reunionSeleccionada]);

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
                <CreateIcon />
              </IconButton>
          </Tooltip>
          <Tooltip title="Cancelar">
           <IconButton color="secondary"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas cancelar la reunión?')) {
                  // Llamar al método cancelarReunion en el puerto 5000
                 
                  fetch('http://localhost:5000/proyecto/cancelarReunion', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ id: row.id })
                    // Opcional: si necesitas enviar datos adicionales
                    // body: JSON.stringify({ reunionId: row.id }),
                  })
                  
                    .then(response => {
                      if (response.ok) {
                        alert('La reunión se canceló correctamente');
                        // Lógica adicional si es necesario
                      } else {
                        
                        alert('Ocurrió un error al cancelar la reunión',error);
                        // Lógica adicional si es necesario
                      }
                    })
                    .catch(error => {
                      alert('Ocurrió un error al cancelar la reunión');
                      console.error(error);
                    });
                }
              }}>
                <HighlightOffIcon />
              </IconButton >
          </Tooltip>
        </Box>
      );
    },},
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
const id = row && row.id; // Verificar si row existe y tiene una propiedad id      alert("aisodkx,",columnaId)
      const ruta = `/proyecto/ActaReunion/${id}`; // Agregar el ID a la ruta

      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="">
            <IconButton color="secondary" component={Link} to={`/proyecto/ActaReunion/${id}`}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
]);

/** 
const columnsCompletas = generarColumnas([
  {
    field: "Acción",
    headerName: "Acción",
    flex: 0.01,
    minWidth: 150,
    headerAlign: "center",
    align: "center",
    renderCell: ({ row }) => {
      const columnaId = row.id; // Obtener el ID de la columna

      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="">
            <IconButton color="secondary" component={Link} to={{ pathname: '/proyecto/ActaReunion', state: { id: columnaId } }}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
  },
]);
*/
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
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="">
           <IconButton color="secondary">
                <VisibilityIcon />
              </IconButton>
          </Tooltip>

        </Box>
      );
    },},
]);
const rowsWithIds = pendientes.map((row) => ({
  ...row,
  id: row.id
}));
const rowsWithIdsc = completadas.map((row) => ({
  ...row,
  id: row.id
}));
const rowsWithIdsx = canceladas.map((row) => ({
  ...row,
  id: row.id
}));

  return (
    <div style={{ margin: "15px" }} >
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <CssBaseline />

      <div style={{ display: 'flex', justifyContent: 'space-between'}}>

        <Typography variant="h1" color={colors.secundary[100]}> REUNIONES </Typography>
        <Tooltip title="crear">
           <IconButton color="secondary" onClick={() => handleOpenModal()}>
                <ControlPointIcon sx={{ fontSize: 20 }}/>
              </IconButton>
          </Tooltip>

          <Dialog open={showModal} onClose={handleCloseModal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <DialogTitle variant="h5">Crear Reunión</DialogTitle>
              <Button onClick={handleCloseModal} startIcon={<HighlightOffIcon />} />
            </div>

            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Fecha"
                      value={fecha}
                      onChange={(newValue) => setFecha(newValue)}
                      renderInput={(props) => <input {...props} />} // Optional: Use this line if you're not using MUI TextField component
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
                  rol
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

      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none"
          },
          "& .MuiDataGrid-columnHeaders": {
            color: colors.primary[100],
            textAlign: "center",
            fontSize: 14
          },
          "& .MuiDataGrid-toolbarContainer": {
            justifyContent: 'flex-end',
            align: "right"
          },
          "& .MuiDataGrid-gridContainer": {
            paddingLeft: "0px", // Ajusta el espaciado izquierdo
            paddingRight: "0px" // Ajusta el espaciado derecho
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
         sx={{ mt: "30px" }}>
        Pendientes
      </Typography>
      <CustomDataGrid rows={rowsWithIds} columns={columnsPendientes} />

      <Dialog open={showModal1} onClose={handleCloseModal1}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <DialogTitle variant="h5">Editar Reunión</DialogTitle>
          <Button onClick={handleCloseModal1} startIcon={<HighlightOffIcon />} />
        </div>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
               label="Fecha"
               value={fecha}
               onChange={(newValue) => setFecha(newValue)}
               renderInput={(props) => <input {...props} />} // Optional: Use this line if you're not using MUI TextField component
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
    
      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none"
          },
          "& .MuiDataGrid-columnHeaders": {
            color: colors.primary[100],
            textAlign: "center",
            fontSize: 14
          },
          "& .MuiDataGrid-toolbarContainer": {
            justifyContent: 'flex-end',
            align: "right"
          },
          "& .MuiDataGrid-gridContainer": {
            paddingLeft: "0px", // Ajusta el espaciado izquierdo
            paddingRight: "0px" // Ajusta el espaciado derecho
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
         sx={{ mt: "30px" }}>
        Completas
      </Typography>
      <CustomDataGrid rows={rowsWithIdsc} columns={columnsCompletas} />
    </Box>
      
    <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none"
          },
          "& .MuiDataGrid-columnHeaders": {
            color: colors.primary[100],
            textAlign: "center",
            fontSize: 14
          },
          "& .MuiDataGrid-toolbarContainer": {
            justifyContent: 'flex-end',
            align: "right"
          },
          "& .MuiDataGrid-gridContainer": {
            paddingLeft: "0px", // Ajusta el espaciado izquierdo
            paddingRight: "0px" // Ajusta el espaciado derecho
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
         sx={{ mt: "30px" }}>
        Canceladas
      </Typography>
      <CustomDataGrid rows={rowsWithIdsx} columns={columnsCanceladas} />
    </Box>
      
      

    
    </div>
  );
}