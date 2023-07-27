import React, { useState, useEffect, useCallback } from "react";

import { Typography, IconButton, useTheme, Box, TextField, Grid, CssBaseline } from "@mui/material";
import { tokens } from "../../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import Tooltip from '@mui/material/Tooltip';
import { Visibility } from '@mui/icons-material';

import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarExport
} from '@mui/x-data-grid';

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <div style={{ display: 'flex', gap: '20px' }}>
                <GridToolbarFilterButton />
                <GridToolbarExport />
            </div>
        </GridToolbarContainer>
    );
}

export default function VerEstudiante() {

    const id = sessionStorage.getItem('admin_id_estudiante');
    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [existe, setExiste] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [estudiante, setEstudiante] = useState({
        nombre: '',
        correo: '',
        num_identificacion: ''
    });

    const [rowsProyectosActivos, setRowsProyectosActivos] = useState([]);
    const [rowsProyectosInactivos, setRowsProyectosInactivos] = useState([]);

    const columns = [
        { field: 'nombre', headerName: 'Nombre', flex: 0.3, minWidth: 150, headerAlign: "center", align: "center" },
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

    const navigate = useNavigate();

    const verProyecto = (id) => {
        sessionStorage.setItem('admin_id_proyecto', id);
        navigate(`/admin/verProyecto`);
    }

    const infoEstudiante = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/verEstudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
                setExiste(false);
            } else {
                setEstudiante(data.estudiante[0]);
                setExiste(true);
            }
        }
        catch (error) {
            setExiste(false);
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [id, token]);

    const llenarProyectosActivos = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/obtenerProyectosActivos", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (data.message === 'No hay proyectos actualmente') {
                setRowsProyectosActivos([]);
            } else {
                setRowsProyectosActivos(data.proyectos);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [id, token]);

    const llenarProyectosInactivos = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/obtenerProyectosInactivos", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (data.message === 'No hay proyectos actualmente') {
                setRowsProyectosInactivos([]);
            } else {
                setRowsProyectosInactivos(data.proyectos);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [id, token]);

    useEffect(() => {
        infoEstudiante();
        llenarProyectosActivos();
        llenarProyectosInactivos();
    }, [infoEstudiante, llenarProyectosActivos, llenarProyectosInactivos]);

    const CustomNoRowsMessage = (mensaje) => {
        return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {mensaje}
            </div>
        );
    }

    return (
        <div style={{ margin: "15px" }} >

            <div style={{ display: 'flex', marginBottom: "20px" }}>
                <Typography
                    variant="h1"
                    color={colors.secundary[100]}
                    fontWeight="bold"
                >
                    VER ESTUDIANTE
                </Typography>
            </div>

            {existe ? (
                <Box >
                    <CssBaseline />
                    <Box >
                        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
                            Información General
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Nombre Completo
                                </Typography>
                                <TextField value={estudiante.nombre || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Correo Electrónico
                                </Typography>
                                <TextField value={estudiante.correo || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Número de Identificación
                                </Typography>
                                <TextField value={estudiante.num_identificacion || ''} fullWidth />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box
                        sx={{
                            "& .MuiDataGrid-root": {
                                border: "none",
                                height: rowsProyectosActivos.length === 0 ? "200px" : "auto",
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
                        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "50px" }}>
                            Proyectos Activos
                        </Typography>
                        <DataGrid
                            getRowHeight={() => 'auto'}
                            rows={rowsProyectosActivos}
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

                    <Box
                        sx={{
                            "& .MuiDataGrid-root": {
                                border: "none",
                                height: rowsProyectosInactivos.length === 0 ? "200px" : "auto",
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                color: colors.primary[100],
                                textAlign: "center",
                                fontSize: 14,
                            },
                            "& .MuiDataGrid-toolbarContainer": {
                                justifyContent: "flex-end",
                                align: "right",
                            },
                        }}
                    >
                        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "50px" }}>
                            Proyectos Inactivos
                        </Typography>
                        <DataGrid
                            getRowHeight={() => 'auto'}
                            rows={rowsProyectosInactivos}
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

                </Box>
            ) : (
                <Typography variant="h6" color={colors.primary[100]}>{mostrarMensaje.mensaje}</Typography>
            )}
        </div>
    );
}