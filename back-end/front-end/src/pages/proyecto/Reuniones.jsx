import React, { useState, useEffect } from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Box, CssBaseline, TextField, Grid } from '@mui/material';
import { Typography, useTheme, Alert, Snackbar} from "@mui/material";
import "./InicioPro.css";
import {  Button, IconButton, Tooltip } from "@mui/material";
import { useCookies } from 'react-cookie';
import { tokens } from "../../theme";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import CreateIcon from '@mui/icons-material/Create';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
      No hay entregas
    </div>
  );
};


export default function Reuniones() {

  const [cookies] = useCookies(['id']);
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [canceladas, setCanceladas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [enlace, setEnlace] = useState("");
  const [rol, setRol] = useState("");

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

  const handleSave = () => {
    console.log("Guardando los valores:");
    console.log("Título:", titulo);
    console.log("Fecha:", fecha);
    console.log("Hora:", hora);
    console.log("Nombre:", nombre);
    console.log("Enlace Reunión:", enlace);
    console.log("Rol:", rol);
    handleCloseModal();
  };
  const handleDateChange = (fecha) => {
    setFecha(fecha);
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
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesPendientes/${cookies.id}`, {
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
      console.log(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };

  const llenarTablaCompletas = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesCompletas/${cookies.id}`, {
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
      console.log(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  }; 

  const llenarTablaCanceladas = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerReunionesCanceladas/${cookies.id}`, {
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
      console.log(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };

  useEffect(() => {
    llenarTablaPendientes();
    llenarTablaCompletas();
    llenarTablaCanceladas();
}, []);

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
           <IconButton color="secondary" style={{ marginRight: '20px' }} onClick={handleOpenModal}>
                <CreateIcon />
              </IconButton>
          </Tooltip>
          <Tooltip title="">
           <IconButton color="secondary">
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
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="">
           <IconButton color="secondary">
                <DescriptionIcon />
              </IconButton>
          </Tooltip>

        </Box>
      );
    },},
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
        <Button startIcon={<ControlPointIcon />}/>
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
      <Dialog open={showModal} onClose={handleCloseModal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <DialogTitle variant="h5">Crear Reunión</DialogTitle>
          <Button onClick={handleCloseModal} startIcon={<HighlightOffIcon />} />
        </div>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha"
                  selected={fecha}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecciona una fecha"
                  item xs={12} sm={6}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                fullWidth
              />
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                >
                  <MenuItem value="cliente">Cliente</MenuItem>
                  <MenuItem value="director">Director</MenuItem>
                  <MenuItem value="lector">Lector</MenuItem>
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