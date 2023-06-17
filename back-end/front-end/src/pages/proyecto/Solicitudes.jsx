import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Box, CssBaseline  } from '@mui/material';
import { Typography, useTheme, Alert, Snackbar} from "@mui/material";
import "./InicioPro.css";
import {  Button, IconButton, Tooltip } from "@mui/material";
import { useCookies } from 'react-cookie';
import { tokens } from "../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import CreateIcon from '@mui/icons-material/Create';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
      No hay solicitudes
    </div>
  );
};


export default function Solicitudes() {

  const [cookies] = useCookies(['id']);
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerSolicitudesPendientes/${cookies.id}`, {
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
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerSolicitudesCompletas/${cookies.id}`, {
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
    renderCell: ({ row }) => {
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
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Ver información">
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
        <Typography variant="h1" color={colors.secundary[100]}> SOLICITUDES </Typography>
        <Tooltip title="crear">
           <IconButton color="secondary" component={Link} to="/proyecto/ActaSolicitud">
                <ControlPointIcon sx={{ fontSize: 20 }}/>
              </IconButton>
          </Tooltip>
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
      
    </div>
  );
}