import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Box, CssBaseline  } from '@mui/material';
import { Typography, useTheme} from "@mui/material";
import "./InicioPro.css";
import {  Button, IconButton, Tooltip } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import {  TextField, Grid } from '@mui/material';
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import dayjs from 'dayjs';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';

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
      No hay solicitudes
    </div>
  );
};

export default function Solicitudes() {

  const id = sessionStorage.getItem('id_proyecto');  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoSol, setTipoSol] = useState("");
  const [fecha, setFecha] = useState(dayjs());
  const [nombre, setNombre] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [open, setOpen] = useState(false);
  const [idSolicitud, setIdSolicitud] = useState(null);
  const abrirDialog = (id) => {
    setIdSolicitud(id)
    setOpen(true);
  };
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
      enqueueSnackbar(mensaje, { variant: variante });
    };
  const handleOpenModal = () => {
    setShowModal(true);
    setFecha(null);
    setNombre("");
    setJustificacion("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFecha(null);
    setNombre("");
    setJustificacion("");
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
        field: 'nombre_tipo_solicitud',
        headerName: 'Tipo',
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
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerSolicitudesPendientes/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message,'error');
      } else {
        const formattedPendientes = data.pendientes.map(row => ({
          ...row,
          fecha: new Date(row.fecha).toLocaleDateString()
        }));
        setPendientes(formattedPendientes);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.","error");
    }
  };

  const llenarTablaCompletas = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerSolicitudesCompletas/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        mostrarMensaje(data.message,'error');
      } else {
        const formattedCompletadas = data.completas.map(row => ({
          ...row,
          fecha: new Date(row.fecha).toLocaleDateString()
        }));
        setCompletadas(formattedCompletadas);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.",'error');
    }
  }; 
  const handleSave = async () => {
    try {
      const data = {
        fecha: fecha,
        justificacion: justificacion  ,
        nombre: nombre
      };
  
      const response = await fetch("http://localhost:5000/proyecto/guardarSolicitud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }

      });
  
      if (response.ok) {
        mostrarMensaje("La solicitud se genero exitosamente.", 'success');
      } else {
        mostrarMensaje("Ocurrió un error.",'error');
      }
      handleCloseModal()
    } catch (error) {
      mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
    }
  };

  useEffect(() => {
    llenarTablaPendientes();
    llenarTablaCompletas();
}, []);

const columnsPendientes = generarColumnas([
  
  {
    field: "Acción",
    headerName: "Acción",
    flex: 0.01,
    minWidth: 150,
    headerAlign: "center",
    align: "center",
    renderCell: () => {
      return (
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Ver información">
           <IconButton color="secondary">
                <VisibilityIcon />
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
      const { id } = row;
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Ver información">
           <IconButton color="secondary">
                <VisibilityIcon  color="secondary" onClick={() => abrirDialog(id)}/>
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

  return (
    <div style={{ margin: "15px" }} >
      
      <CssBaseline />

      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h1" color={colors.secundary[100]}> SOLICITUDES </Typography>
        <Tooltip title="crear">
           <IconButton color="secondary" onClick={() => handleOpenModal()}>
                <ControlPointIcon sx={{ fontSize: 20 }}/>
              </IconButton>
          </Tooltip>

          <Dialog open={showModal} onClose={handleCloseModal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <DialogTitle variant="h5">Crear Solicitud</DialogTitle>
              <Button onClick={handleCloseModal} startIcon={<HighlightOffIcon />} />
            </div>

            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                    <InputLabel>Tipo De Solicitud</InputLabel>
                    <Select
                      onChange={(e) => setTipoSol(e.target.value)}
                    >
                      <MenuItem value="sol1">sol1</MenuItem>
                      <MenuItem value="sol2">sol2</MenuItem>
                      <MenuItem value="sol3">sol3</MenuItem>
                    </Select>
                  </FormControl>
                  </Grid>
              
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Justificacion"
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    fullWidth
                  />
                </Grid>
                
              </Grid>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center" }}>
              <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontSize: "0.6rem" }}>
                Enviar
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
            paddingLeft: "0px", 
            paddingRight: "0px"
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
         sx={{ mt: "30px" }}>
        Pendientes
      </Typography>
      <CustomDataGrid rows={rowsWithIds} columns={columnsPendientes} />
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
            paddingLeft: "0px",
            paddingRight: "0px"
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
         sx={{ mt: "30px" }}>
        Completas
      </Typography>
      <CustomDataGrid rows={rowsWithIdsc} columns={columnsCompletas} />
    </Box>
      
    </div>
  );
}