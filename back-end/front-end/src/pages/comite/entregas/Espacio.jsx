import React, { useState, useEffect } from "react";

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

import { useTheme, Box, Typography, IconButton, Tooltip, AppBar, Toolbar, Button } from '@mui/material';
import { Delete, Source, AddCircleOutline } from '@mui/icons-material';
import CrearEspacio from "./Ventanas/CrearEspacio";
import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';
import VerModificarEspacio from "./Ventanas/VerModificarEspacio";

export default function Espacios() {
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);
    const [espacios, setEspacios] = useState([]);
    const [espacio, setEspacio] = useState({});

    const obtenerEspacios = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/espacio", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setEspacios(data.espacios);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerEspacioPorId = async (espacio_id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/espacio/${espacio_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setEspacio(data.espacio)
                abrirDialogVerEspacio()
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const eliminarEspacio = async (espacio_id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/espacio/${espacio_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                mostrarMensaje(data.message, "success")
                obtenerEspacios()
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };


    const generarColumnas = (extraColumns) => {
        const columns = [
            {
                field: "editar",
                headerName: "",
                flex: 0.1,
                minWidth: 50,
                renderCell: ({ row }) => {
                    const { id } = row;
                    return (
                        <Box width="100%" ml="10px" display="flex" justifyContent="center">
                            <Tooltip title="Ver espacio">
                                <IconButton color="secondary" onClick={() => obtenerEspacioPorId(id)}>
                                    <Source />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar espacio">
                                <IconButton color="secondary" onClick={() => eliminarEspacio(id)}>
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                },
            },
            { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150 },
            { field: 'descripcion', headerName: 'Descripción', flex: 0.2, minWidth: 150 },
            { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
            { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
            { field: 'nombre_rol', headerName: 'Calificador', flex: 0.1, minWidth: 100 },
            { field: 'nombre_modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100 },
            { field: 'nombre_etapa', headerName: 'Etapa', flex: 0.1, minWidth: 100 },
            { field: 'nombre_rubrica', headerName: 'Rubrica', flex: 0.2, minWidth: 150 },
            { field: 'fecha_creacion', headerName: 'Fecha de creación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') }

        ]
        return [...columns, ...extraColumns];
    };

    const columns = generarColumnas([
    ]);
    const [open, setOpen] = useState(false);

    const abrirDialog = () => {
        setOpen(true);
    };

    const cerrarDialog = () => {
        setOpen(false);
    }
    const cerrarEspacioCreado = () => {
        obtenerEspacios();
        setOpen(false);

    }
    const [abrirVerEspacio, setAbrirVerEspacio] = useState(false);
    const abrirDialogVerEspacio = () => {
        setAbrirVerEspacio(true);
    };

    const cerrarVerEspacio = () => {
        setAbrirVerEspacio(false);
    }
    const cerrarEspacioModificado = () => {
        obtenerEspacios();
        setAbrirVerEspacio(false);

    }
    useEffect(() => {
        obtenerEspacios();
    }, []);

    return (
        <div >
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold" sx={{ flexGrow: 1 }}>
                        ESPACIOS DE ENTREGAS
                    </Typography>
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirDialog} sx={{
                        width: 150,
                    }}>
                        Crear espacio
                    </Button>
                </Toolbar>
            </AppBar>
            <CrearEspacio
                open={open}
                onSubmit={cerrarEspacioCreado}
                onClose={cerrarDialog} />
            <VerModificarEspacio
                open={abrirVerEspacio}
                onSubmit={cerrarEspacioModificado}
                onClose={cerrarVerEspacio}
                espacio={espacio} />
            <Box sx={{ m: 2 }}>
                <Typography variant="h6">
                    Al modificar un espacio, los cambios se aplicarán a todas las entregas de este espacio.
                </Typography>
                <CustomDataGrid rows={espacios} columns={columns} mensaje="No hay espacios creados" />
            </Box>
        </div>
    );
}