import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';
import {
    Typography,
    AppBar,
    Toolbar,
    Button,
    Box,
    Tooltip,
    IconButton,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Dialog,
    Slide
} from '@mui/material';

import { AddCircleOutline, Delete, Source } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";

import CrearRubrica from "./Ventanas/CrearRubrica";
import VerModificarRubrica from "./Ventanas/VerModificarRubrica";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Rubricas() {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { enqueueSnackbar } = useSnackbar();

    const token = useSelector(selectToken);

    const [rubricas, setRubricas] = useState([]);
    const [rubrica, setRubrica] = useState({});

    const [abrirCrear, setAbrirCrear] = useState(false);
    const [abrirVer, setAbrirVer] = useState(false);

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const abrirCrearRubrica = () => {
        setAbrirCrear(true);
    };
    const cerrarCrearRubrica = () => {
        setAbrirCrear(false);
    }
    const cerrarRubricaCreada = () => {
        setAbrirCrear(false);
        obtenerRubricas()
    };

    const cerrarVerModificarRubrica = () => {
        setAbrirVer(false);
        setRubrica({})
    }
    const cerrarRubricaModificada = () => {
        setAbrirVer(false);
        setRubrica({})
        obtenerRubricas()
    }
    const abrirVerModificarRubrica = async (rubrica) => {
        setRubrica(rubrica)
        setAbrirVer(true);
    }

    const eliminarRubrica = async (id) => {
        setOpen(false);
        try {
            const response = await fetch(`${apiBaseUrl}/comite/rubrica/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                mostrarMensaje(data.message, "success");
                obtenerRubricas()
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }

    const obtenerRubricas = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/obtenerRubricasAspectos`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRubricas(data.rubricas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const columnas = [
        { field: 'id', headerName: 'Identificador', flex: 0.1, minWidth: 200, align: "center" },
        { field: 'rubrica_nombre', headerName: 'Nombre', flex: 0.4, minWidth: 100, align: "center" },
        { field: 'rubrica_descripcion', headerName: 'Descripción', flex: 0.4, minWidth: 100, align: "center" },
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
                                <IconButton color="secondary" onClick={() => abrirVerModificarRubrica(row)}>
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

    useEffect(() => {
        obtenerRubricas();
    }, []);

    const [open, setOpen] = useState(false);
    const confirmarEliminacion = (rubrica) => {
        setRubrica(rubrica);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color="secondary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        RUBRICAS
                    </Typography>
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirCrearRubrica} sx={{
                        width: 150,
                    }}>
                        Crear Rubrica
                    </Button>
                </Toolbar>
            </AppBar>

            <CrearRubrica
                open={abrirCrear}
                onClose={cerrarCrearRubrica}
                onSubmit={cerrarRubricaCreada}
            />
            <VerModificarRubrica
                open={abrirVer}
                rubrica={rubrica}
                onClose={cerrarVerModificarRubrica}
                onSubmit={cerrarRubricaModificada}
            />
            <CustomDataGrid rows={rubricas} columns={columnas} mensaje="No hay rubricas creadas." />
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
            >
                <DialogTitle variant="h1" color="primary">
                    ¿Está seguro de que quiere eliminar la rúbrica?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText variant="h4">
                        No se puede recuperar una rubrica una vez eliminada y no podrá eliminarla si está siendo utilizado en un espacio.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="naranja">Cancelar</Button>
                    <Button onClick={() => { eliminarRubrica(rubrica.id); }} variant="contained" sx={{ width: 150 }}>Continuar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
