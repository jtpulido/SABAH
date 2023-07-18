import React, { useState, useEffect, useCallback } from "react";

import { useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, IconButton } from "@mui/material";

import { Visibility } from '@mui/icons-material';
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarFilterButton,
    GridToolbarExport
} from '@mui/x-data-grid';

import ControlPointIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';

import { useSnackbar } from 'notistack';

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function Usuarios() {

    const navigate = useNavigate();
    const columns = [
        {
            field: 'nombre', headerName: 'Nombre Completo', flex: 0.2, minWidth: 100,
            headerAlign: "center", align: "center"
        },
        { field: 'correo', headerName: 'Correo Electrónico', flex: 0.2, minWidth: 110, headerAlign: "center", align: "center" },
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
                        <Tooltip title="Ver Usuario" sx={{ fontSize: '20px' }}>
                            <IconButton aria-label="fingerprint" color="secondary" onClick={() => verUsuario(id)}>
                                <Visibility />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Modificar Usuario" sx={{ fontSize: '20px' }}>
                            <IconButton aria-label="fingerprint" color="secondary" onClick={() => modificarUsuario(id)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Cambiar Estado" sx={{ fontSize: '20px' }}>
                            <IconButton aria-label="fingerprint" color="secondary" onClick={() => cambiarEstado(id, row.estado)}>
                                <DoDisturbIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }
    ];

    const verUsuario = (id) => {
        sessionStorage.setItem('admin_id_usuario', id);
        navigate(`/admin/verUsuario`)
    };

    const modificarUsuario = (id) => {
        sessionStorage.setItem('admin_id_usuario', id);
        navigate(`/admin/modificarUsuario`)
    };

    const handleAgregarUsuario = () => {
        navigate(`/admin/agregarUsuario`)
    };

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);
    const [rowsUsuarios, setRowsUsuarios] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const llenarTablaUsuarios = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/obtenerUsuarios", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setRowsUsuarios(data.usuarios);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token]);

    useEffect(() => {
        llenarTablaUsuarios();
    }, [llenarTablaUsuarios]);

    const cambiarEstado = useCallback(async (valorId, valorEstado) => {
        try {
            const response = await fetch("http://localhost:5000/admin/cambiarEstado", {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: valorId, estado: !valorEstado })
            });

            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                mostrarMensaje(data.message, "success");
                llenarTablaUsuarios();
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token, llenarTablaUsuarios]);

    return (
        <div style={{ margin: "15px" }} >

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "25px" }}>
                <Typography
                    variant="h1"
                    color={colors.secundary[100]}
                    fontWeight="bold"
                >
                    USUARIOS
                </Typography>
                <Tooltip title="Agregar Usuario" sx={{ fontSize: '20px' }}>
                    <ControlPointIcon sx={{ color: '#B8CF69', fontSize: 30, marginRight: "5px", cursor: "pointer" }} onClick={handleAgregarUsuario} />
                </Tooltip>
            </div>

            <Box
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
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
                <DataGrid
                    rows={rowsUsuarios}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    getRowHeight={() => 'auto'}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    disableColumnSelector
                />
            </Box>

        </div>
    );
}