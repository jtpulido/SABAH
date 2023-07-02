import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Alert, Snackbar, IconButton, Tooltip } from "@mui/material";
import { Source, Person, Edit } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import CustomDataGrid from "../../layouts/DataGrid";

export default function Jurados() {
  const navigate = useNavigate();
  const generarColumnas = (extraColumns) => {
    const columns = [
      {
        field: 'nombre_jurado',
        headerName: 'Nombre del jurado',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => {
          return params.value || "Por Asignar";
        },
      },
      {
        field: 'fecha_asignacion',
        headerName: 'Fecha de asignación',
        flex: 0.2,
        minWidth: 150,
        headerAlign: "center",
        align: "center",
        valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES')
      },
      {
        field: 'codigo',
        headerName: 'Código del proyecto',
        flex: 0.1,
        minWidth: 100,
        headerAlign: "center",
        align: "center"
      },
      {
        field: 'etapa_estado',
        headerName: 'Estado del proyecto',
        flex: 0.2,
        minWidth: 100,
        headerAlign: "center",
        align: "center",
        valueGetter: (params) =>
          `${params.row.etapa || ''} - ${params.row.estado || ''}`,
      },
      {
        field: "ver",
        headerName: "",
        width: 200,
        flex: 0.01,
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
        }
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
        const { id_jurado } = row;
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            {id_jurado ? (
              <Tooltip title="Cambiar Jurado">
                <IconButton color="secondary">
                  <Edit />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Asignar Jurado">
                <IconButton color="secondary">
                  <Person />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    }
  ]);

  const columns = generarColumnas([]);

  const verProyecto = (id_proyecto) => {
    navigate(`/comite/verProyecto/${id_proyecto}`)
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const token = useSelector(selectToken);
  const [rowsActivos, setRowsActivos] = useState([]);
  const [rowsCerrados, setRowsCerrados] = useState([]);
  const [rowsInactivos, setRowsInactivos] = useState([]);
  const [error, setError] = useState(null);
  const handleClose = () => setError(null);

  const llenarTabla = async (endpoint, setRows) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/juradosproyectos/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message);
      } else {
        setRows(data.jurados);
      }
    } catch (error) {
      setError("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.");
    }
  };

  useEffect(() => {
    llenarTabla("activos", setRowsActivos);
    llenarTabla("cerrados", setRowsCerrados);
    llenarTabla("inactivos", setRowsInactivos);
  }, []);

  return (
    <div style={{ margin: "15px" }}>
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity="error" onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold">
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
        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Proyectos en desarrollo
        </Typography>
        <CustomDataGrid rows={rowsActivos} columns={columnsEditar} mensaje="No hay jurados" />

        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Proyectos cerrados
        </Typography>
        <CustomDataGrid rows={rowsCerrados} columns={columns} mensaje="No hay jurados" />

        <Typography variant="h2" color={colors.primary[100]} sx={{ mt: "30px" }}>
          Inactivos
        </Typography>
        <CustomDataGrid rows={rowsInactivos} columns={columns} mensaje="No hay jurados" />
      </Box>
    </div>
  );
}
