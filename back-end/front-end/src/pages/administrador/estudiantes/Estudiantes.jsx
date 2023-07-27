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

import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

export default function Estudiantes() {

    const navigate = useNavigate();
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

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);
    const [rowsEstudiantes, setRowsEstudiantes] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const llenarTablaEstudiantes = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/obtenerEstudiantes", {
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
        <div style={{ margin: "15px" }} >

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "25px" }}>
                <Typography
                    variant="h1"
                    color={colors.secundary[100]}
                    fontWeight="bold"
                >
                    ESTUDIANTES
                </Typography>
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
                    rows={rowsEstudiantes}
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