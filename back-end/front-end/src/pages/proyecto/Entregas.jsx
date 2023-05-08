import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import {  Button, IconButton, Tooltip } from "@mui/material";
import { Typography, useTheme, Alert, Snackbar, Box, TextField, CssBaseline, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import "./Entregas.css";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { tokens } from "../../theme";
import { useCookies } from 'react-cookie';
import { Source, Feed } from '@mui/icons-material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CreateIcon from '@mui/icons-material/Create';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';


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
export default function Entregas() {
  
  const [cookies] = useCookies(['id']);
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [link, setLink] = useState('');

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setLink("");
  };

  const handleSave = () => {
    console.log("Guardando el valor:", link);
    handleCloseModal();
  };
    const handleSaveProyecto = () => {
    console.log("Guardando el valor:", link);
    handleCloseModal();
  };

  const generarColumnasPendientes = (extraColumns) => {
    const commonColumns = [
      {
        field: 'nombre_entrega',
        headerName: 'Nombre',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
      },
      {
        field: 'fecha_limite',
        headerName: 'Fecha Limite',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
      },
      
    ];

    return [...commonColumns, ...extraColumns];
  };
  const generarColumnasCompletadas = (extraColumns) => {
    const commonColumns = [
      {
        field: 'nombre_entrega',
        headerName: 'Nombre',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
      },
      {
        field: 'fecha_entrega',
        headerName: 'Fecha Limite',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
      },
      
    ];

    return [...commonColumns, ...extraColumns];
  };


  const llenarTablaPendientes = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerentregasPendientes/${cookies.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setPendientes(data.pendientes.pendientes);
        console.log(pendientes)
      }
    }
    catch (error) {
      console.log(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  const llenarTablaCompletadas = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerEntregasCompletadas/${cookies.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setCompletadas(data.completas);
      }
    }
    catch (error) {
      console.log(error)
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };


  useEffect(() => {
      llenarTablaPendientes();
      llenarTablaCompletadas();
  }, []);
  const columnsPendientes = generarColumnasPendientes([
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
                  <CreateIcon />
                </IconButton>
            </Tooltip>
          </Box>
        );
      },},
  ]);
  const columnsCompletadas = generarColumnasCompletadas([
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
                  <Feed />
                </IconButton>
            </Tooltip>
          </Box>
        );
      },},
  ]);

  const rowsWithIds = pendientes.map((row) => ({
    ...row,
    id: row.entrega_id
  }));
  const rowsWithIdsc = completadas.map((row) => ({
    ...row,
    id: row.entrega_id
  }));
  return (
    <div style={{ margin: "15px" }}> 

    {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}  
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h1" color={colors.secundary[100]}> ENTREGAS </Typography>
       </div>
      
            <div style={{ display: 'flex' , justifyContent: 'center', alignItems: 'center'}}>
              <Box sx={{ border: '1px solid rgba(128, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5">Artefactos De Control</Typography>
                <Button startIcon={<InsertLinkIcon />} onClick={handleOpenModal}></Button>
                <Dialog open={showModal} onClose={handleCloseModal}>
                  <div style={{ display: 'flex' }}>
                    <DialogTitle variant='h5'>Artefactos de control</DialogTitle>
                    <DialogActions>
                    <Button onClick={handleCloseModal} startIcon={<HighlightOffIcon/>}></Button>
                  </DialogActions>
                  </div>
                  
                  <DialogContent>
                    <TextField
                      label="Link carpeta drive"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' , justifyContent: 'center'}}>
                      <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontSize: '0.6rem' }} >
                        Guardar
                      </Button>
                    </div>
                  </DialogActions>
                </Dialog>
              </div>
               </Box>
               <Box sx={{ border: '1px solid rgba(128, 128, 128, 0.5)', borderRadius: '10px', p: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5">Documentos Del Proyecto</Typography>
                  <Button startIcon={<InsertLinkIcon />} onClick={handleOpenModal}></Button>
                    <Dialog open={showModal} onClose={handleCloseModal}>
                      <div style={{ display: 'flex' }}>
                        <DialogTitle variant='h5'>Documentos Del Proyecto</DialogTitle>
                        <DialogActions>
                        <Button onClick={handleCloseModal} startIcon={<HighlightOffIcon/>}></Button>
                      </DialogActions>
                      </div>
                      
                      <DialogContent>
                        <TextField
                          label="Link carpeta drive"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                        />
                      </DialogContent>
                      <DialogActions sx={{ justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' , justifyContent: 'center'}}>
                          <Button onClick={handleSaveProyecto} variant="contained" color="primary" sx={{ fontSize: '0.6rem' }} >
                            Guardar
                          </Button>
                        </div>
                  </DialogActions>
                </Dialog>
                </div>
               </Box>
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
      <CustomDataGrid rows={rowsWithIdsc} columns={columnsCompletadas} />
    </Box>

    
    </div>
    
  );
}
