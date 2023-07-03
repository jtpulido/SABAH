import React, { useState, useEffect } from "react";

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { Alert, useTheme, Snackbar, Box, Typography, IconButton, Tooltip, AppBar, Toolbar, Button } from '@mui/material';
import { Delete, Source, AddCircleOutline } from '@mui/icons-material';
import CrearEspacio from "./Rubricas/CrearEspacio";
import CustomDataGrid from "../../layouts/DataGrid";

export default function Espacios() {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);

    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const menError = () => setError(null);
    const menSuccess = () => setMensaje(null);

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
                setError(data.message);
            } else if (response.status === 203) {
                setMensaje(data.message)
            } else if (response.status === 200) {
                setRoles(data.roles);
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener los items. Por favor, intente de nuevo más tarde.");
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
                setError(data.message);
            } else if (response.status === 203) {
                setMensaje(data.message)
            } else if (response.status === 200) {
                setModalidades(data.modalidades);
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener los items. Por favor, intente de nuevo más tarde.");
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
                setError(data.message);
            } else if (response.status === 203) {
                setMensaje(data.message)
            } else if (response.status === 200) {
                setEtapas(data.etapas);
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener los items. Por favor, intente de nuevo más tarde.");

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
                setError(data.message);
            } else if (response.status === 203) {
                setMensaje(data.message)
            } else if (response.status === 200) {
                setRubricas(data.rubricas);
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener los items. Por favor, intente de nuevo más tarde.");
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
                setError(data.message);
            } else if (response.status === 203) {
                setMensaje(data.message)
            } else if (response.status === 200) {
               setEspacios(data.espacios);
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener los items. Por favor, intente de nuevo más tarde.");
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
                setError(data.message);
            } else {
                // Hacer algo con el item obtenido
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al obtener el esapcio. Por favor, intente de nuevo más tarde.");
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
                setError(data.message);
            } else {
                obtenerEspacios();
            }
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al crear el item. Por favor, intente de nuevo más tarde.");
        }
    };
    const eliminarEspacio = async (espacio_id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/espacio/${espacio_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = response.json();
            if (!data.success) {
                setError(data.message);
            }
            await obtenerEspacios()
        } catch (error) {
            setError("Lo siento, ha ocurrido un error al eliminar el espacio. Por favor, intente de nuevo más tarde.");
        }
    };


    const generarColumnas = (extraColumns) => {
        const columns = [
            {
                field: "Acción",
                flex: 0.1,
                minWidth: 50,
                headerAlign: "center",
                align: "center",
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
            { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
            { field: 'descripcion', headerName: 'Descripción', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center" },
            { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
            { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
            { field: 'fecha_creacion', headerName: 'Fecha de creación', flex: 0.2, minWidth: 150, headerAlign: "center", align: "center", valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
            { field: 'nombre_rol', headerName: 'Calificador', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
            { field: 'nombre_modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
            { field: 'nombre_etapa', headerName: 'Etapa', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" },
            { field: 'nombre_rubrica', headerName: 'Rubrica', flex: 0.1, minWidth: 100, headerAlign: "center", align: "center" }
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
                onClose={cerrarDialog} roles={roles || []} modalidades={modalidades || []} etapas={etapas || []} rubricas={rubricas || []}
            />
            <Box sx={{ m: 2 }}>
                {error && (
                    <Snackbar open={true} autoHideDuration={4000} onClose={menError} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                        <Alert severity="error" onClose={menError}>
                            {error}
                        </Alert>
                    </Snackbar>
                )}
                {mensaje && (
                    <Snackbar open={true} autoHideDuration={3000} onClose={menSuccess} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                        <Alert onClose={menSuccess} severity="success">
                            {mensaje}
                        </Alert>
                    </Snackbar>
                )}
                <Typography variant="h2" color={colors.primary[100]} sx={{ mb: "30px" }}>
                    Espacios creados
                </Typography>

                <CustomDataGrid rows={espacios} columns={columns} mensaje="No hay espacios creados" />
            </Box>
        </div>
    );
}