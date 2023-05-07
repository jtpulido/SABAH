import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';

import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Box, Typography, useTheme, Alert, Snackbar, IconButton, Tooltip } from "@mui/material";
import { Source, Feed } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

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
export default function Proyectos() {

  const navigate = useNavigate();
  const generarColumnas = (extraColumns) => {
    const commonColumns = [
      {
        field: "Acción", headerName: "", flex: 0.01, minWidth: 50, headerAlign: "center", align: "center",
        renderCell: ({ row }) => {
          const { id, id_proyecto } = row;
          return (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Tooltip title="Ver Solicitud">
                <IconButton color="secondary" onClick={() => verSolicitud(id)}>
                  <Feed />
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
      { field: 'tipo_solicitud', headerName: 'Tipo de solicitud', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'fecha_solicitud', headerName: 'Fecha de solicitud', flex: 0.15, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
      { field: 'codigo_proyecto', headerName: 'Código', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center" },
      {
        field: 'etapa_estado', headerName: 'Estado Proyecto', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center",
        valueGetter: (params) =>
          `${params.row.etapa_proyecto || ''} - ${params.row.estado || ''}`,
      },

    ];

    return [...commonColumns, ...extraColumns];
  };

  const columnsPendientes = generarColumnas([{ field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.15, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') }]);
  const columnsAprobadas = generarColumnas([
    { field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.15, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    { field: 'fecha_aprobado_comite', headerName: 'Aprobado Comité', flex: 0.15, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') }
  ]);
  const columnsRechazadas = generarColumnas([
    { field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.15, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
    { field: 'fecha_aprobado_comite', headerName: 'Rechazada Comité', flex: 0.15, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') }
  ]);

  const verProyecto = (id) => {
    navigate(`/comite/verProyecto/${id}`)
  }
  const verSolicitud = (id) => {
  }
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);
  const [rowsEnCurso, setRowsEnCurso] = useState([]);
  const [rowsAprobadas, setRowsAprobadas] = useState([]);
  const [rowsRechazadas, setRowsRechazadas] = useState([]);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTablaEnCurso = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/solicitudes/pendienteaprobacion", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsEnCurso(data.solicitudes);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  const llenarTablaAprobadas = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/solicitudes/aprobadas", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsAprobadas(data.solicitudes);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  const llenarTablaRechazadas = async () => {
    try {
      const response = await fetch("http://localhost:5000/comite/solicitudes/rechazadas", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsRechazadas(data.solicitudes);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };
  useEffect(() => {
    llenarTablaEnCurso()
    llenarTablaAprobadas()
    llenarTablaRechazadas()
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
        SOLICITUDES
      </Typography>

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
          }
        }}
      > <Typography variant="h2" color={colors.primary[100]}
        sx={{ mt: "30px" }}>
          Pendientes
        </Typography>
        <CustomDataGrid rows={rowsEnCurso} columns={columnsPendientes} />

        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Aprobadas
        </Typography>
        <CustomDataGrid rows={rowsAprobadas} columns={columnsAprobadas} />

        <Typography variant="h2" color={colors.primary[100]}
          sx={{ mt: "30px" }}>
          Rechazadas
        </Typography>
        <CustomDataGrid rows={rowsRechazadas} columns={columnsRechazadas} />

      </Box>

    </div>
  );
}