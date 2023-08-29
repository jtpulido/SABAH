import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

import { Box, Typography, IconButton, Tooltip, AppBar, Toolbar, Button, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Delete, Source, AddCircleOutline } from '@mui/icons-material';
import CrearEspacio from "./Ventanas/CrearEspacio";
import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';
import VerModificarEspacio from "./Ventanas/VerModificarEspacio";
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export default function Espacios() {
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
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
        setOpen(false);
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
                        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
                            <Box mr="5px">
                                <Tooltip title="Ver espacio">
                                    <IconButton color="secondary" onClick={() => obtenerEspacioPorId(id)}>
                                        <Source />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box ml="5px">
                                <Tooltip title="Eliminar espacio">
                                    <IconButton color="naranja" onClick={() => confirmarEliminacion(row)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    );
                },
            },
            { field: 'nombre', headerName: 'Nombre', flex: 0.2, minWidth: 150 },
            { field: 'descripcion', headerName: 'Descripción', flex: 0.2, minWidth: 150 },
            { field: 'fecha_apertura_entrega', headerName: 'Fecha de apertura entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
            { field: 'fecha_cierre_entrega', headerName: 'Fecha de cierre entregas', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
            { field: 'fecha_apertura_calificacion', headerName: 'Fecha de apertura calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
            { field: 'fecha_cierre_calificacion', headerName: 'Fecha de cierre calificación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
            { field: 'nombre_rol', headerName: 'Calificador', flex: 0.1, minWidth: 100 },
            { field: 'nombre_modalidad', headerName: 'Modalidad', flex: 0.1, minWidth: 100 },
            { field: 'nombre_etapa', headerName: 'Etapa', flex: 0.1, minWidth: 100 },
            { field: 'nombre_rubrica', headerName: 'Rubrica', flex: 0.2, minWidth: 150 },
            { field: 'anio', headerName: 'Año', flex: 0.1, minWidth: 100 },
            { field: 'periodo', headerName: 'Periodo', flex: 0.1, minWidth: 100 },
            { field: 'fecha_creacion', headerName: 'Fecha de creación', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') }

        ]
        return [...columns, ...extraColumns];
    };

    const columns = generarColumnas([
    ]);
    const [abrirCrearEspacio, setAbrirCrearEspacio] = useState(false);

    const abrirDialog = () => {
        setAbrirCrearEspacio(true);
    };

    const cerrarDialog = () => {
        setAbrirCrearEspacio(false);
    }
    const cerrarEspacioCreado = () => {
        obtenerEspacios();
        setAbrirCrearEspacio(false);
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
    const [open, setOpen] = useState(false);
    const confirmarEliminacion = (espacio) => {
        setEspacio(espacio);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <div >
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
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
                open={abrirCrearEspacio}
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
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
            >
                <DialogTitle variant="h1" color="primary">
                    ¿Está seguro de que quiere eliminar el espacio?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText variant="h4">
                        No se puede recuperar un espacio una vez eliminado y no podrá eliminarlo si ya se realizo por lo menos una entrega.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="naranja">Cancelar</Button>
                    <Button onClick={() => { eliminarEspacio(espacio.id); }} variant="contained" sx={{ width: 150 }}>Continuar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}