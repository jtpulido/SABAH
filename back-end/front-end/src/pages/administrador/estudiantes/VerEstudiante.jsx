import React, { useState, useEffect, useCallback } from "react";

import { Typography, IconButton, Box, TextField, Grid, CssBaseline, Toolbar, AppBar } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import Tooltip from '@mui/material/Tooltip';
import { Visibility } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";


export default function VerEstudiante() {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const id = sessionStorage.getItem('admin_id_estudiante');
    const token = useSelector(selectToken);
    const navigate = useNavigate();
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

    const verProyecto = (id) => {
        sessionStorage.setItem('admin_id_proyecto', id);
        navigate(`/admin/verProyecto`);
    }

    const infoEstudiante = useCallback(async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/verEstudiante/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
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
            const response = await fetch(`${apiBaseUrl}/admin/obtenerProyectosActivos/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
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
            const response = await fetch(`${apiBaseUrl}/admin/obtenerProyectosInactivos/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
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

    return (
        <div >
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar>
                    <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        VER ESTUDIANTE
                    </Typography>
                </Toolbar>
            </AppBar>



            {existe ? (
                <Box sx={{ m: 2 }}>
                    <CssBaseline />
                    <Box >
                        <Typography variant="h3" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
                            Información General
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Nombre Completo
                                </Typography>
                                <TextField value={estudiante.nombre || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Correo Electrónico
                                </Typography>
                                <TextField value={estudiante.correo || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Número de Identificación
                                </Typography>
                                <TextField value={estudiante.num_identificacion || ''} fullWidth />
                            </Grid>
                        </Grid>
                    </Box>
                    <Box >
                        <Typography variant="h3" color="secondary" sx={{ mt: "50px" }}>
                            Proyectos Activos
                        </Typography>
                        <CustomDataGrid rows={rowsProyectosActivos} columns={columns} mensaje="No hay proyectos" />

                        <Typography variant="h3" color="secondary" sx={{ mt: "50px" }}>
                            Proyectos Inactivos
                        </Typography>
                        <CustomDataGrid rows={rowsProyectosInactivos} columns={columns} mensaje="No hay proyectos" />
                    </Box>
                </Box>
            ) : (
                <Typography variant="h6" color="primary">{mostrarMensaje.mensaje}</Typography>
            )}
        </div>
    );
}