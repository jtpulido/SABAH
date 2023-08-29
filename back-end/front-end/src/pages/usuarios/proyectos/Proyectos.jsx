import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, AppBar, Toolbar } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';

import { Visibility } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

import CustomDataGrid from "../../layouts/DataGrid";


export default function Proyectos() {

    const idUsuario = sessionStorage.getItem('user_id_usuario');
    const idRol = sessionStorage.getItem('id_rol');
    const navigate = useNavigate();

    let nombreRol = '';
    if (idRol === '1') {
        nombreRol = 'DIRECTOR';
    } else if (idRol === '2') {
        nombreRol = 'LECTOR';
    } else if (idRol === '3') {
        nombreRol = 'JURADO';
    }

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
    const token = useSelector(selectToken);
    const [rowsEnCurso, setRowsEnCurso] = useState([]);
    const [rowsTerminados, setRowsTerminados] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const llenarTablaEnCurso = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/usuario/obtenerProyectosDesarrolloRol/${idUsuario}/${idRol}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
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
            const response = await fetch(`http://localhost:5000/usuario/obtenerProyectosCerradosRol/${idUsuario}/${idRol}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
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

    return (
        <div>
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar>
                    <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        PROYECTOS ASOCIADOS AL ROL {nombreRol}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ m: 3 }}>
                <Typography variant="h2" color="primary"
                    sx={{ mt: "30px" }}>
                    En desarrollo
                </Typography>
                <CustomDataGrid rows={rowsEnCurso || []} columns={columns} mensaje="No hay proyectos" />

                <Typography variant="h2" color="primary"
                    sx={{ mt: "30px" }}>
                    Cerrados
                </Typography>
                <CustomDataGrid rows={rowsTerminados || []} columns={columns} mensaje="No hay proyectos" />

            </Box>
        </div>
    );
}