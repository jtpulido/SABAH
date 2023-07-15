import React, { useState, useEffect } from "react";
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';
import {
    Typography,
    useTheme,
    Divider,
    Box,
    Button,
    TextField,
    AppBar,
    Toolbar,
    IconButton,
    Tooltip
} from '@mui/material';

import { Delete, Source } from "@mui/icons-material";

export default function Aspectos() {
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [aspectos, setAspectos] = useState([]);

    const [nombre, setNombre] = useState("");

    const obtenerAspectos = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                setAspectos(data.aspectos);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error al obtener los aspectos. Por favor, intente de nuevo más tarde.", "error");
        }
    };

    const crearAspecto = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setNombre("");
                obtenerAspectos();
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const eliminarAspecto = async (aspectoId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspectoId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                mostrarMensaje(data.message, "success");
                obtenerAspectos();
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const modificarAspecto = async (aspectoId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspectoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setNombre("");
                obtenerAspectos();
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const obtenerAspectoPorId = async (aspectoId) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspectoId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                // Hacer algo con el aspecto obtenido
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };
    const columnas = [
        { field: 'id', headerName: 'Identificador', flex: 0.1, minWidth: 200, align: "center" },
        { field: 'nombre', headerName: 'Nombre', flex: 0.8, minWidth: 100, align: "center" },
        {
            field: "calificar",
            headerName: "",
            flex: 0.1,
            minWidth: 50,
            renderCell: ({ id }) => {
                return (
                    <Box width="100%" ml="10px" display="flex" justifyContent="center">
                        <Tooltip title="Ver aspecto">
                            <IconButton color="secondary" onClick={() => obtenerAspectoPorId(id)}>
                                <Source />
                            </IconButton>

                        </Tooltip>
                        <Tooltip title="Eliminar Aspecto">
                            <IconButton color="secondary" onClick={() => eliminarAspecto(id)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }
    ]
    useEffect(() => {
        obtenerAspectos();
    }, []);

    const handleNombreASChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };



    return (
        <div style={{ margin: "15px" }}>
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold" sx={{ flexGrow: 1 }}>
                        ASPECTOS
                    </Typography>
                </Toolbar>
            </AppBar>
            <Typography variant="h3" color={colors.naranja[100]}>
                Crear Aspecto
            </Typography>
            <form onSubmit={crearAspecto}>
                <TextField
                    label="Nombre del aspecto"
                    value={nombre}
                    required
                    onChange={(e) => handleNombreASChange(e.target.value)}
                    fullWidth
                    margin="normal"
                    error={!nombre}
                    helperText={'Ingresa el nombre del aspecto'}
                />
                <Button variant="contained" color="primary" type='submit'>
                    Crear Aspecto
                </Button>
            </form>

            <Divider sx={{ mt: "15px", mb: "15px" }} />

            <CustomDataGrid rows={aspectos} columns={columnas} mensaje="No hay aspectos." />
        </div>
    );
}
