import React, { useState, useEffect } from "react";
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';
import {
    Typography,
    useTheme,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    Button
} from '@mui/material';

import { AddCircleOutline, Delete, Source } from "@mui/icons-material";
import CrearAspecto from "./Ventanas/CrearAspecto";
import VerModificarAspecto from "./Ventanas/VerModificarAspecto";

export default function Aspectos() {
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [aspectos, setAspectos] = useState([]);
    const [aspecto, setAspecto] = useState({});



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
    const crearAspecto = async () => {
        abrirCrearAspecto()
    }
    const verModificarAspecto = async (aspecto) => {
        setAspecto(aspecto)
        abrirModificarAspecto()

    }
    const columnas = [
        { field: 'id', headerName: 'Identificador', flex: 0.1, minWidth: 200, align: "center" },
        { field: 'nombre', headerName: 'Nombre', flex: 0.8, minWidth: 100, align: "center" },
        {
            field: "calificar",
            headerName: "",
            flex: 0.1,
            minWidth: 50,
            renderCell: ({ row }) => {
                return (
                    <Box width="100%" ml="10px" display="flex" justifyContent="center">
                        <Tooltip title="Ver aspecto">
                            <IconButton color="secondary" onClick={() => verModificarAspecto(row)}>
                                <Source />
                            </IconButton>

                        </Tooltip>
                        <Tooltip title="Eliminar Aspecto">
                            <IconButton color="secondary" onClick={() => eliminarAspecto(row.id)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }
    ]
    const [abrirCrear, setAbrirCrear] = useState(false);

    const abrirCrearAspecto = () => {
        setAbrirCrear(true);
    };

    const cerrarCrearAspecto = () => {
        setAbrirCrear(false);
        obtenerAspectos()
    }
    const [abrirModificar, setAbrirModificar] = useState(false);

    const abrirModificarAspecto = () => {
        setAbrirModificar(true);
    };

    const cerrarModificarAspecto = () => {
        setAbrirModificar(false);
        obtenerAspectos()
    }

    useEffect(() => {
        obtenerAspectos();
    }, []);

    return (
        <div style={{ margin: "15px" }}>
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold" sx={{ flexGrow: 1 }}>
                        ASPECTOS
                    </Typography>
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirCrearAspecto}>
                        Crear Aspecto
                    </Button>
                </Toolbar>
            </AppBar>
            <CrearAspecto
                open={abrirCrear}
                onClose={cerrarCrearAspecto}
            />
            <VerModificarAspecto
                open={abrirModificar}
                onClose={cerrarModificarAspecto}
                aspecto={aspecto}
            />
            <CustomDataGrid rows={aspectos} columns={columnas} mensaje="No hay aspectos." />
        </div>
    );
}
