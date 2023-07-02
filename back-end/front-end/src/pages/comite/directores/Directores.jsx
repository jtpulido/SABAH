import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Alert, Snackbar, IconButton, Tooltip } from "@mui/material";
import { Source, Person, Edit } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import CustomDataGrid from "../../layouts/DataGrid";

export default function Directores() {
  const navigate = useNavigate();
  const generarColumnas = (extraColumns) => {
    const columns = [
      { field: 'nombre_director', headerName: 'Nombre del director', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
      { field: 'fecha_asignacion', headerName: 'Fecha de asignación', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
      { field: 'codigo', headerName: 'Código del proyecto', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
      {
        field: 'etapa_estado', headerName: 'Estado del proyecto', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center",
        valueGetter: (params) => `${params.row.etapa || ''} - ${params.row.estado || ''}`,
      },
      {
        field: "Acción",
        headerName: '',
        width: 200,
        flex: 0.1,
        minWidth: 100,
        headerAlign: "center",
        align: "center",
        renderCell: ({ row }) => {
          const { id_proyecto } = row;
          return (
            <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
              <Tooltip title="Ver proyecto">
                <IconButton color="secondary" onClick={() => verProyecto(id_proyecto)}>
                  <Source />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      }
    ];
    return [...columns, ...extraColumns];
  };

  const columnsEditar = generarColumnas([
    {
      field: "editar",
      headerName: "",
      flex: 0.01,
      headerAlign: "center",
      align: "center",
      renderCell: ({ row }) => {
        const { id_director } = row;
        const tooltipTitle = id_director ? "Cambiar Director" : "Asignar Director";
        const iconButtonIcon = id_director ? <Edit /> : <Person />;
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Tooltip title={tooltipTitle}>
              <IconButton color="secondary">
                {iconButtonIcon}
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ]);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);

  const [rowsActivos, setRowsActivos] = useState([]);
  const [rowsCerrados, setRowsCerrados] = useState([]);
  const [rowsInactivos, setRowsInactivos] = useState([]);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/directoresproyectos/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRowsFunc(data.directores);
      }
    }
    catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };

  useEffect(() => {
    llenarTabla("activos", setRowsActivos);
    llenarTabla("cerrados", setRowsCerrados);
    llenarTabla("inactivos", setRowsInactivos);
  }, []);

  const verProyecto = (id_proyecto) => {
    navigate(`/comite/verProyecto/${id_proyecto}`);
  };

  return (
    <div style={{ margin: "15px" }} >
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold">
        DIRECTORES POR PROYECTO
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
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Proyectos en desarrollo
        </Typography>
        <CustomDataGrid rows={rowsActivos} columns={columnsEditar} mensaje="No hay directores" />
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Proyectos cerrados
        </Typography>
        <CustomDataGrid rows={rowsCerrados} columns={columnsEditar} mensaje="No hay directores" />
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Inactivos
        </Typography>
        <CustomDataGrid rows={rowsInactivos} columns={columnsEditar} mensaje="No hay directores" />
      </Box>
    </div>
  );
}
