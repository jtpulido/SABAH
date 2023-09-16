import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, AppBar, Toolbar } from "@mui/material";

import { Visibility } from '@mui/icons-material';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import CustomDataGrid from "../../layouts/DataGrid";


export default function Estudiantes() {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const token = useSelector(selectToken);
    const [rowsEstudiantes, setRowsEstudiantes] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const columns = [
        {
            field: 'nombre', headerName: 'Nombre Completo', flex: 0.2, minWidth: 100,
            headerAlign: "center", align: "center"
        },
        { field: 'correo', headerName: 'Correo Electrónico', flex: 0.2, minWidth: 110, headerAlign: "center", align: "center" },
        {
            field: 'num_identificacion', headerName: 'Número de Identificación', flex: 0.2, minWidth: 100,
            headerAlign: "center", align: "center"
        },
        {
            field: "id",
            headerName: "Acción",
            width: 100,
            flex: 0.08, minWidth: 110, headerAlign: "center", align: "center",
            renderCell: ({ row: { id }, row }) => {
                return (
                    <Box
                        width="100%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                    >
                        <Tooltip title="Ver Estudiante" sx={{ fontSize: '20px', marginRight: '5px' }}>
                            <IconButton aria-label="fingerprint" color="secondary" onClick={() => verEstudiante(id)}>
                                <Visibility />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }
    ];

    const verEstudiante = (id) => {
        sessionStorage.setItem('admin_id_estudiante', id);
        navigate(`/admin/verEstudiante`)
    };

    const llenarTablaEstudiantes = useCallback(async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/obtenerEstudiantes`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setRowsEstudiantes(data.estudiantes);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token]);

    useEffect(() => {
        llenarTablaEstudiantes();
    }, [llenarTablaEstudiantes]);

    return (
        <div >
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar>
                    <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        ESTUDIANTES
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ m: 3 }}>
                <CustomDataGrid rows={rowsEstudiantes} columns={columns} mensaje="No hay estudiantes" />
            </Box>

        </div>
    );
}