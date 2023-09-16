import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';
import {
    Typography,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Slide
} from '@mui/material';

import { AddCircleOutline, Delete, Source } from "@mui/icons-material";
import CrearAspecto from "./Ventanas/CrearAspecto";
import VerModificarAspecto from "./Ventanas/VerModificarAspecto";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Aspectos() {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const token = useSelector(selectToken);

    const [aspectos, setAspectos] = useState([]);
    const [aspecto, setAspecto] = useState({});

    const obtenerAspectos = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/aspecto`, {
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
        setOpen(false);
        try {
            const response = await fetch(`${apiBaseUrl}/comite/aspecto/${aspectoId}`, {
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

    const columnas = [
        { field: 'id', headerName: 'Identificador', flex: 0.1, minWidth: 200, align: "center" },
        { field: 'nombre', headerName: 'Nombre', flex: 0.8, minWidth: 100, align: "center" },
        {
            field: "accion",
            headerName: "",
            flex: 0.1,
            minWidth: 50,
            renderCell: ({ row }) => {
                return (
                    <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
                        <Box mr="5px">
                            <Tooltip title="Ver aspecto">
                                <IconButton color="secondary" onClick={() => verModificarAspecto(row)}>
                                    <Source />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box ml="5px">
                            <Tooltip title="Eliminar Aspecto">
                                <IconButton color="naranja" onClick={() => confirmarEliminacion(row)}>
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                );
            },
        }
    ]
    const [abrirCrear, setAbrirCrear] = useState(false);
    const [abrirModificar, setAbrirModificar] = useState(false);

    const abrirCrearAspecto = () => {
        setAbrirCrear(true);
    };

    const cerrarCrearAspecto = () => {
        setAbrirCrear(false);
    }
    const cerrarAspectoAgregado = () => {
        obtenerAspectos()
        setAbrirCrear(false);
    };

    const verModificarAspecto = async (aspecto) => {
        setAspecto(aspecto)
        setAbrirModificar(true)

    }
    const cerrarModificarAspecto = () => {
        setAbrirModificar(false);
        setAspecto({})
    }
    const cerrarAspectoModificado = () => {
        setAspecto({})
        obtenerAspectos()
        setAbrirModificar(false);
    };

    useEffect(() => {
        obtenerAspectos();
    }, []);
    const [open, setOpen] = useState(false);
    const confirmarEliminacion = (aspecto) => {
        setAspecto(aspecto);
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
                        ASPECTOS
                    </Typography>
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirCrearAspecto} sx={{
                        width: 150,
                    }}>
                        Crear Aspecto
                    </Button>
                </Toolbar>
            </AppBar>
            <CrearAspecto
                open={abrirCrear}
                onClose={cerrarCrearAspecto}
                onSubmit={cerrarAspectoAgregado}
            />
            <VerModificarAspecto
                open={abrirModificar}
                onClose={cerrarModificarAspecto}
                onSubmit={cerrarAspectoModificado}
                aspecto={aspecto}
            />
            <CustomDataGrid rows={aspectos} columns={columnas} mensaje="No hay aspectos." />

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
            >
                <DialogTitle variant="h1" color="primary">
                    ¿Está seguro de que quiere eliminar el aspecto?
                    </DialogTitle>
                <DialogContent>
                    <DialogContentText variant="h4">
                        No se puede recuperar un aspecto una vez eliminado y no podrá eliminarlo si está siendo utilizado en una rúbrica.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="naranja">Cancelar</Button>
                    <Button onClick={() => { eliminarAspecto(aspecto.id); }} variant="contained" sx={{ width: 150 }}>Continuar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
