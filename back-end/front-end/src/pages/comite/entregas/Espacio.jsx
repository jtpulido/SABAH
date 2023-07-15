import React, { useState, useEffect } from "react";

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useTheme, Box, Typography, IconButton, Tooltip, AppBar, Toolbar, Button } from '@mui/material';
import { Delete, Source, AddCircleOutline } from '@mui/icons-material';
import CrearEspacio from "./Ventanas/CrearEspacio";
import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';

export default function Espacios() {
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);

    const [roles, setRoles] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [etapas, setEtapas] = useState([]);
    const [rubricas, setRubricas] = useState([]);

    const [espacios, setEspacios] = useState([]);
    const obtenerRoles = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/roles", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setRoles(data.roles);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerModalidades = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/modalidades", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setModalidades(data.modalidades);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerEtapas = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/etapas", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setEtapas(data.etapas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerRubricas = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/rubricas", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setRubricas(data.rubricas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
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
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const crearEspacio = async (espacioData) => {
        try {
            const response = await fetch("http://localhost:5000/comite/espacio", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(espacioData)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                obtenerEspacios();
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
            { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150, align: "center" },
            { field: 'descripcion', headerName: 'Descripción', flex: 0.2, minWidth: 150, align: "center" },
            { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.2, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
            { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.2, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
            { field: 'fecha_creacion', headerName: 'Fecha de creación', flex: 0.2, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
            { field: 'nombre_rol', headerName: 'Calificador', flex: 0.1, minWidth: 100, align: "center" },
            { field: 'nombre_modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, align: "center" },
            { field: 'nombre_etapa', headerName: 'Etapa', flex: 0.1, minWidth: 100, align: "center" },
            { field: 'nombre_rubrica', headerName: 'Rubrica', flex: 0.1, minWidth: 100, align: "center" }
        ]
        return [...columns, ...extraColumns];
    };

    const columns = generarColumnas([
    ]);
    const [open, setOpen] = useState(false);

    const abrirDialog = () => {
        setOpen(true);
    };

    const cerrarDialog = (espacioData) => {
        setOpen(false);
        if (espacioData) {
            crearEspacio(espacioData)
        };
    }
    useEffect(() => {
        obtenerRoles();
        obtenerModalidades();
        obtenerRubricas()
        obtenerEtapas();
        obtenerEspacios();
    }, []);

    return (
        <div >

            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold" sx={{ flexGrow: 1 }}>
                        ESPACIOS DE ENTREGAS
                    </Typography>
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirDialog}>
                        Agregar espacio
                    </Button>
                </Toolbar>
            </AppBar>
            <CrearEspacio
                open={open}
                onClose={cerrarDialog} roles={roles} modalidades={modalidades} etapas={etapas} rubricas={rubricas}
            />
            <Box sx={{ m: 2 }}>

                <Typography variant="h2" color={colors.primary[100]} sx={{ mb: "30px" }}>
                    Espacios creados
                </Typography>

                <CustomDataGrid rows={espacios} columns={columns} mensaje="No hay espacios creados" />
            </Box>
        </div>
    );
}