import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import {  IconButton, Tooltip } from "@mui/material";
import { Typography, useTheme, Box, TextField } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import "./Entregas.css";
import { useSelector } from "react-redux";
import { selectToken } from "../../store/authSlice";
import { tokens } from "../../theme";
import axios from 'axios';
import { Feed } from '@mui/icons-material';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import UploadIcon from '@mui/icons-material/Upload';
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
      No hay entregas
    </div>
  );
};

export default function Entregas() {
  
  const [file, setFile] = useState(null);
  const id = sessionStorage.getItem('id_proyecto');
  const token = useSelector(selectToken);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);
  const [pendientes, setPendientes] = useState([]);
  const [completadas, setCompletadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [link, setLink] = useState('');
  const { enqueueSnackbar } = useSnackbar();

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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUploadClick = () => {
    document.getElementById('file-upload').click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/upload', formData);
    } catch (error) {
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        link: link,
        tipol: 'A'  ,
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
        mostrarMensaje("La solicitud se genero exitosamente.","success");
      } else {
        mostrarMensaje("Ocurrió un error.","error");
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
          tipol: 'D'  ,
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
          mostrarMensaje("La solicitud se genero exitosamente.","success");
        } else {
         mostrarMensaje("Ocurrió un error.","error");
        }
        handleCloseModal()
      } catch (error) {
       mostrarMensaje("Ocurrió un error al realizar la solicitud al backend:", 'error');
      }
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
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerentregasPendientes/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message);
      } else {
        setPendientes(data.pendientes.pendientes);
        
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.",'error')
      
    }
  };
  const llenarTablaCompletadas = async () => {
    
    try {
      
      const response = await fetch(`http://localhost:5000/proyecto/obtenerEntregasCompletadas/${id}`, {
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
            <form onSubmit={handleSubmit}>
                  <input
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    
                  />

                  <Tooltip title="">
                  <IconButton 
                      aria-label="Subir archivo" 
                      onClick={handleUploadClick} 
                      color="secondary"
                    >
                      <UploadFileIcon />
                    </IconButton>
            </Tooltip>
                </form>
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
 
      <div style={{ display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h1" color={colors.secundary[100]}> ENTREGAS </Typography>
       </div>
      
      <div style={{ display: 'flex' , justifyContent: 'flex', marginTop: '20px'}}>
            <Box sx={{ border: '1px solid rgba(100, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px', flexGrow: 1, backgroundColor: '#f2f2f2', height: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h5" style={{ textAlign: 'center', flex: '1', marginTop: 'auto', marginBottom: 'auto' }}>Artefactos De Control</Typography>
                <Tooltip title="">
                  <IconButton 
                      aria-label="Artefactos De Control" 
                      onClick={handleOpenModal} 
                      color="secondary"
                    >
                      <InsertLinkIcon />
                    </IconButton>
                  </Tooltip>
                <Dialog open={showModal} onClose={handleCloseModal}>
                  <div style={{ display: 'flex' , justifyContent: 'space-between'}}>
                    <DialogTitle variant='h5'>Artefactos de control</DialogTitle>
                    <DialogActions>
                    <Tooltip title="">
                      <IconButton 
                          aria-label="Cerrar Pestaña" 
                          onClick={handleCloseModal} 
                          color="secondary"
                        >
                          <HighlightOffIcon />
                        </IconButton>
                      </Tooltip>
                  </DialogActions>
                  </div>
                <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                  <DialogContent>
                    <TextField
                      label="Link carpeta drive"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'center' }}>

                      <Tooltip title="">
                      <IconButton 
                          aria-label="GuardarLink" 
                          onClick={handleSave} 
                          color="secondary"
                        >
                          <UploadIcon />
                        </IconButton>
                      </Tooltip>
                      </DialogActions>
                    </div>
                  
                </Dialog>
              </div>
               </Box>
               <Box sx={{ border: '1px solid rgba(100, 128, 128, 0.5)', borderRadius: '10px', p: 2, marginRight: '10px', flexGrow: 1, backgroundColor: '#f2f2f2', height: '50px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                   <Typography variant="h5" style={{ textAlign: 'center', flex: '1', marginTop: 'auto', marginBottom: 'auto' }}>Documentos Del Proyecto</Typography>
                   <Tooltip title="">
                      <IconButton 
                          aria-label="Documentos del proyecto" 
                          onClick={handleOpenModal1} 
                          color="secondary"
                        >
                          <InsertLinkIcon />
                        </IconButton>
                      </Tooltip>
                    <Dialog open={showModal1} onClose={handleCloseModal1}>
                      <div style={{ display: 'flex' }}>
                        <DialogTitle variant='h4'>Documentos Del Proyecto</DialogTitle>
                        <DialogActions>
                        <Tooltip title="">
                            <IconButton 
                                aria-label="cerrar ventana" 
                                onClick={handleCloseModal1} 
                                color="secondary"
                              > 
                                <HighlightOffIcon />
                              </IconButton>
                            </Tooltip>
                      </DialogActions>
                      </div>

                      <div style={{ display: 'flex' }}>

                      <DialogContent>
                        <TextField
                          label="Link carpeta drive"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                        />
                      </DialogContent>
                      <DialogActions sx={{ justifyContent: 'center' }}>
                          <Tooltip title="">
                            <IconButton 
                                aria-label="guardar" 
                                onClick={handleSaveProyecto} 
                                color="secondary"
                              > 
                                <UploadIcon />
                              </IconButton>
                            </Tooltip>
                            </DialogActions>
                        </div>
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
            paddingLeft: "0px", 
            paddingRight: "0px" 
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
         sx={{ mt: "30px" }}>
        Abiertas
      </Typography>
      <DataGrid rows={rowsWithIds} columns={columnsPendientes} />
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
        Cerradas
      </Typography>
      <CustomDataGrid rows={rowsWithIdsc} columns={columnsCompletadas} />
    </Box>

    
    </div>
    
  );
}
