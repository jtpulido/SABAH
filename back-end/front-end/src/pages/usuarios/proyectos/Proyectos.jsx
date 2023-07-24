import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, IconButton } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';

import { Visibility } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarExport
} from '@mui/x-data-grid';

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function Proyectos() {

    const idUsuario = sessionStorage.getItem('id_usuario');
    const idRol = sessionStorage.getItem('id_rol');
    const navigate = useNavigate();

    const columns = [
        {
            field: 'nombre', headerName: 'Nombre', flex: 0.3, minWidth: 150,
            headerAlign: "center"
        },
        { field: 'codigo', headerName: 'Código', flex: 0.2, minWidth: 100, headerAlign: "center", align: "center" },
        { field: 'modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
        { field: 'anio', headerName: 'Año', flex: 0.05, minWidth: 100, headerAlign: "center", align: "center" },
        { field: 'periodo', headerName: 'Periodo', flex: 0.05, minWidth: 100, headerAlign: "center", align: "center" },
        { field: 'etapa', headerName: 'Etapa', flex: 0.15, minWidth: 100, headerAlign: "center", align: "center" },
        { field: 'estado', headerName: 'Estado', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
        {
            field: "id",
            headerName: "Acción",
            width: 100,
            flex: 0.05, minWidth: 100, headerAlign: "center", align: "center",
            renderCell: ({ row: { id } }) => {
                return (
                    <Box
                        width="100%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                    >
                        <Tooltip title="Ver Proyecto" sx={{ fontSize: '20px' }}>
                            <IconButton aria-label="fingerprint" color="secondary" onClick={() => verProyecto(id)}>
                                <Visibility />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }
    ];

    const verProyecto = (id) => {
        sessionStorage.setItem('id_proyecto', id);
        navigate(`/user/verProyecto`)
    }

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);
    const [rowsEnCurso, setRowsEnCurso] = useState([]);
    const [rowsTerminados, setRowsTerminados] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const llenarTablaEnCurso = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/usuario/obtenerProyectosDesarrolloRol", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 'id_usuario': idUsuario, 'id_rol': idRol })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (data.message === 'No hay proyectos actualmente') {
                setRowsEnCurso([]);
            } else {
                setRowsEnCurso(data.proyectos);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token, idUsuario, idRol, mostrarMensaje]);

    const llenarTablaCerrados = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/usuario/obtenerProyectosCerradosRol", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 'id_usuario': idUsuario, 'id_rol': idRol })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (data.message === 'No hay proyectos actualmente') {
                setRowsTerminados([]);
            } else {
                setRowsTerminados(data.proyectos);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token, idUsuario, idRol, mostrarMensaje]);

    useEffect(() => {
        llenarTablaEnCurso();
        llenarTablaCerrados();
    }, [llenarTablaEnCurso, llenarTablaCerrados]);

    const CustomNoRowsMessage = (mensaje) => {
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {mensaje}
            </div>
        );
    }

    return (
        <div style={{ margin: "15px" }} >

            <Typography
                variant="h1"
                color="secondary"
                fontWeight="bold"
            >
                PROYECTOS
            </Typography>

            <Box            >
                <Typography variant="h2" color="primary"
                    sx={{ mt: "30px" }}>
                    En desarrollo
                </Typography>
                <DataGrid
                    getRowHeight={() => 'auto'}
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
                    slots={{
                        toolbar: CustomToolbar,
                        noRowsOverlay: () => CustomNoRowsMessage('No hay proyectos')
                    }}
                    disableColumnSelector
                />
            </Box>

            <Box>
                <Typography variant="h2" color="primary"
                    sx={{ mt: "30px" }}>
                    Cerrados
                </Typography>
                <DataGrid
                    getRowHeight={() => 'auto'}
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
                    slots={{
                        toolbar: CustomToolbar,
                        noRowsOverlay: () => CustomNoRowsMessage('No hay proyectos')
                    }}
                    disableColumnSelector
                />
            </Box>

        </div>
    );
}