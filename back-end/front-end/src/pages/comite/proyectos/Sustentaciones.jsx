import React, { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Toolbar, AppBar, Tooltip, Button } from "@mui/material";

import { AddCircleOutline, EditNote, Visibility } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CustomDataGrid from "../../layouts/DataGrid";
import ProgramarSustentacion from "./Ventana/ProgramarSustentacion";
import CambiarProgramacionSustentacion from "./Ventana/CambiarProgramacionSustentacion";

export default function Sustentaciones() {
  const navigate = useNavigate();

  const verProyecto = (id) => {
    sessionStorage.setItem('id_proyecto', id);
    navigate(`/comite/verProyecto`)
  }
  const token = useSelector(selectToken);
  const [fechas_sustentaciones, setFechasSustentaciones] = useState([]);
  const [sustentacion, setSustentacion] = useState({});
  const [openSustentacion, setOpenSustentacion] = useState(false);
  const [openModificarSustentacion, setOpenModificarSustentacion] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const mostrarMensaje = (mensaje, variante) => {
    enqueueSnackbar(mensaje, { variant: variante });
  };
  const abrirDialogProgramarSustentacion = () => {
    setOpenSustentacion(true);
  };

  const cerrarDialogProgramarSustentacion = () => {
    setSustentacion({})
    setOpenSustentacion(false);
  }
  const cerrarDialogSustentacionProgramada = () => {
    setOpenSustentacion(false);
    setSustentacion({})
    setFechasSustentaciones([])
    llenarTabla("sustentacion", setFechasSustentaciones);
  }
  const abrirDialogModificarSustentacion = (sustentacion) => {
    setSustentacion(sustentacion)
    setOpenModificarSustentacion(true);
  };

  const cerrarDialogModificarSustentacion = () => {
    setOpenModificarSustentacion(false);
    setSustentacion({})
  }
  const cerrarDialogSustentacionModificada = () => {
    setOpenModificarSustentacion(false);
    setSustentacion({})
    llenarTabla("sustentacion", setFechasSustentaciones);
  }
  const llenarTabla = async (endpoint, setRowsFunc) => {
    try {
      const response = await fetch(`http://localhost:5000/comite/${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.success) {
        mostrarMensaje(data.message, "error")
      } else if (response.status === 203) {
        mostrarMensaje(data.message, "warning")
      } else if (response.status === 200) {
        setRowsFunc(data.sustentacion);
      }
    }
    catch (error) {
      mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
    }
  };

  useEffect(() => {
    llenarTabla("sustentacion", setFechasSustentaciones);
  }, []);
  const columns = [
    { field: 'fecha_sustentacion', headerName: 'Fecha Sustentación', flex: 0.1, minWidth: 150},
    { field: 'lugar', headerName: 'Lugar Sustentación', flex: 0.2, minWidth: 150, },
    { field: 'nombre', headerName: 'Nombre', flex: 0.4, minWidth: 150, headerAlign: "center" },
    { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, },
    { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, },
    { field: 'anio', headerName: 'Año', flex: 0.05, minWidth: 100, },
    { field: 'periodo', headerName: 'Periodo', flex: 0.05, minWidth: 100, },
    {
      headerName: '',
      field: "id",
      width: 100,
      flex: 0.05, minWidth: 50,
      renderCell: ({ row }) => {
        return (
          <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
            <Box mr="5px">
              <Tooltip title="Ver Proyecto">
                <IconButton color="secondary" onClick={() => verProyecto(row.id_proyecto)}>
                  <Visibility />
                </IconButton>
              </Tooltip>
            </Box>
            <Box ml="5px">
              <Tooltip title="Programar Sustentación">
                <IconButton color="secondary" size="large" onClick={() => abrirDialogModificarSustentacion(row)}>
                  <EditNote fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );
      },
    }
  ];
  return (
    <div>
      <AppBar position="static" color="transparent" variant="contained" >

        <Toolbar >
          <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
            SUSTENTACIONES DE PROYECTOS
          </Typography>
          <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirDialogProgramarSustentacion} sx={{
            width: 150,
          }}>
            Programar Sustentación
          </Button>
        </Toolbar>
      </AppBar>
      <ProgramarSustentacion
        open={openSustentacion}
        onClose={cerrarDialogProgramarSustentacion}
        sustentacion={sustentacion || {}}
        onSubmit={cerrarDialogSustentacionProgramada}
      />
      <CambiarProgramacionSustentacion
        open={openModificarSustentacion}
        onClose={cerrarDialogModificarSustentacion}
        sustentacion={sustentacion || {}}
        onSubmit={cerrarDialogSustentacionModificada}
      />
      <Box sx={{ m: 2 }}>
        <CustomDataGrid rows={fechas_sustentaciones || []} columns={columns} mensaje="No se han programado sustentaciones." />
      </Box>
    </div>

  );
}