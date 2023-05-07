import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Alert, Snackbar, IconButton, Tooltip } from "@mui/material";

import { Source, Person } from '@mui/icons-material';
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
function CustomDataGrid({ rows, columns }) {
  const [height, setHeight] = useState('200px');

  useEffect(() => {
    setHeight(rows.length > 0 ? 'auto' : '200px');
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
      No hay jurados
    </div>
  );
};
export default function Jurados() {
  const navigate = useNavigate();
  const columns = [
    { field: 'nombre_jurado', headerName: 'Nombre del jurado', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
    { field: 'fecha_asignacion', headerName: 'Fecha de asignación', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    { field: 'codigo', headerName: 'Código del proyecto', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
    {
      field: 'etapa_estado', headerName: 'Estado del proyecto', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center",
      valueGetter: (params) =>
        `${params.row.etapa || ''} - ${params.row.estado || ''}`,
    },
    {
      field: "Acción",
      width: 200,
      flex: 0.1,
      minWidth: 100,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const { id_jurado, id_proyecto } = row;
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Tooltip title="Ver Jurado">
              <IconButton color="secondary" onClick={() => verJurado(id_jurado)}>
                <Person />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver proyecto">
              <IconButton color="secondary" onClick={() => verProyecto(id_proyecto)}>
                <Source />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },

  ];
  const verProyecto = (id_proyecto) => {
    navigate(`/comite/verProyecto/${id_proyecto}`)
  }
  const verJurado = (id_jurado) => {
  }
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);
  const [rowsActivos, setRowsActivos] = useState([]);
  const [rowsInactivos, setRowsInactivos] = useState([]);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTablaActivos = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/juradosproyectos/activos", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsActivos(data.jurados);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  const llenarTablaInactivos = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/juradosproyectos/inactivos", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsInactivos(data.jurados);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  useEffect(() => {
    llenarTablaActivos()
    llenarTablaInactivos()
  }, []);
  return (
    <div style={{ margin: "15px" }} >
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
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
        JURADOS POR PROYECTO
      </Typography>
      <Box
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cellContent": {
            textAlign: "center"
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
      >
        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Activos
        </Typography>
        <CustomDataGrid rows={rowsActivos} columns={columns} />

        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Inactivos
        </Typography>
        <CustomDataGrid rows={rowsInactivos} columns={columns} />
      </Box>

    </div>
  );
}