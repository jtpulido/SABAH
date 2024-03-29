import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Source, Edit } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import CustomDataGrid from "../../../layouts/DataGrid";


import { useSnackbar } from 'notistack';
import VerModificarUsuario from "../Ventana/VerModificarUsuario";

export default function Directores() {
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };

  const generarColumnas = (extraColumns) => {
    const columns = [

      { field: 'nombre_director', headerName: 'Nombre del director', flex: 0.2, minWidth: 150 },
      { field: 'fecha_asignacion', headerName: 'Fecha de asignación', flex: 0.2, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
      { field: 'codigo', headerName: 'Código del proyecto', flex: 0.1, minWidth: 100 },
      { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100 },
      {
        field: 'etapa_estado', headerName: 'Estado del proyecto', flex: 0.2, minWidth: 100,
        valueGetter: (params) => `${params.row.etapa || ''} - ${params.row.estado || ''}`,
      },
      {
        field: "Acción",
        headerName: '',
        flex: 0.1,
        minWidth: 100,
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
    ]
    return [...columns, ...extraColumns];
  };
  const columns = generarColumnas([]);
  const columnsEditar = generarColumnas([
    {
      field: "editar", headerName: "", flex: 0.01,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Tooltip title="Ver/Cambiar Director">
              <IconButton color="secondary" onClick={() => abrirDialog(row, "modificar")}>
                <Edit />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ]);
  const token = useSelector(selectToken);

  const [rowsActivos, setRowsActivos] = useState([]);
  const [rowsCerrados, setRowsCerrados] = useState([]);
  const [rowsInactivos, setRowsInactivos] = useState([]);

  const rol = "DIRECTOR";
  const [info, setInfo] = useState({});
  const [accion, setAccion] = useState("");
  const [abrirVerModificarUsuario, setAbrirVerModificarUsuario] = useState(false);

  const abrirDialog = (row, accion) => {
    setAccion(accion)
    setInfo(row)
    setAbrirVerModificarUsuario(true);
  };

  const cerrarDialog = () => {
    setAbrirVerModificarUsuario(false);
  }
  const cerrarUsuarioCambiado = () => {
    llenarTabla("activos", setRowsActivos);
    llenarTabla("cerrados", setRowsCerrados);
    llenarTabla("inactivos", setRowsInactivos);
    setAbrirVerModificarUsuario(false);
  }
  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`${apiBaseUrl}/comite/directoresproyectos/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsFunc(data.directores);
      }
    }
    catch (error) {
      mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
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

      <Typography variant="h1" color="secondary" fontWeight="bold">
        DIRECTORES POR PROYECTO
      </Typography>
      <VerModificarUsuario
        open={abrirVerModificarUsuario}
        onSubmit={cerrarUsuarioCambiado}
        onClose={cerrarDialog}
        informacion={info}
        rol={rol}
        accion={accion} />
      <Box>
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Proyectos en desarrollo
        </Typography>
        <CustomDataGrid rows={rowsActivos} columns={columnsEditar} mensaje="No hay directores" />
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Proyectos cerrados
        </Typography>
        <CustomDataGrid rows={rowsCerrados} columns={columns} mensaje="No hay directores" />
        <Typography variant="h2" color="primary" sx={{ mt: "30px" }}>
          Inactivos
        </Typography>
        <CustomDataGrid rows={rowsInactivos} columns={columns} mensaje="No hay directores" />
      </Box>
    </div>
  );
}
