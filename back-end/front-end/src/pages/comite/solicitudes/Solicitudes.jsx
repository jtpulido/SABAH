import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Alert, Snackbar, IconButton, Tooltip } from "@mui/material";

import { Visibility, Source } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function Proyectos() {
  const navigate = useNavigate();
  const columns = [
    { field: 'tipo', headerName: 'Tipo de solicitud', flex: 0.2, minWidth: 150, headerAlign: "center" },
    { field: 'fecha', headerName: 'Fecha de solicitud', flex: 0.2, minWidth: 150, headerAlign: "center" },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center" },
   {
      field: 'etapa_estado', headerName: 'Estado Proyecto', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center", 
      valueGetter: (params) =>
        `${params.row.etapa || ''} - ${params.row.estado || ''}`,
    },
    {
      field: "id", headerName: "Acción", width: 100, flex: 0.2, minWidth: 100, headerAlign: "center", align: "center",
      renderCell: ({ row: { id } }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center"          >
            <Tooltip title="Ver solicitud"><IconButton color="secondary" onClick={() => verProyecto(id)}>
              <Visibility />
            </IconButton></Tooltip>
            <Tooltip title="Ver proyecto"><IconButton color="secondary" onClick={() => verProyecto(id)} >
              <Source />
            </IconButton></Tooltip>


          </Box>
        );
      },
    }
  ];
  const verProyecto = (id) => {
    navigate(`/comite/verProyecto/${id}`)
  }
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);
  const [rowsEnCurso, setRowsEnCurso] = useState([]);
  const [rowsTerminados, setRowsTerminados] = useState([]);

  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTablaEnCurso = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/obtenerEnCurso", {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsEnCurso(data.proyectos);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  const llenarTablaCerrados = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/obtenerTerminados", {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsTerminados(data.proyectos);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  useEffect(() => {
    llenarTablaEnCurso()
    llenarTablaCerrados()
  }, []);
  return (
    <div style={{ margin: "15px" }} >
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <Typography
        variant="h1"
        color={colors.secundary[100]}
        fontWeight="bold"
      >
        SOLICITUDES
      </Typography>

      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            color: colors.primary[100],
            textAlign: "center",
            fontSize: 14
          },
          "& .MuiDataGrid-toolbarContainer": {
            justifyContent: 'flex-end',
            align: "right"
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
        sx={{ mt: "30px" }}>
          Pendientes
        </Typography>
        <DataGrid
          rows={rowsEnCurso}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowHeight={() => 'auto'}
          slots={{
            toolbar: CustomToolbar,
          }}
          disableColumnSelector
        />
        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Aprobadas
        </Typography>

        <DataGrid
          rows={rowsTerminados}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowHeight={() => 'auto'}
          slots={{
            toolbar: CustomToolbar,
          }}
          disableColumnSelector
        />
        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Rechazadas
        </Typography>

        <DataGrid
          rows={rowsTerminados}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          getRowHeight={() => 'auto'}
          slots={{
            toolbar: CustomToolbar,
          }}
          disableColumnSelector
        />
      </Box>

    </div>
  );
}