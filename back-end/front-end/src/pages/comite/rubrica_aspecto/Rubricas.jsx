import React, { useState, useEffect } from "react";
import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';
import {
    Typography,
    useTheme,
    AppBar,
    Toolbar,
    Button,
    Box,
    Tooltip,
    IconButton
} from '@mui/material';

import { AddCircleOutline, Delete, Source } from '@mui/icons-material';

import CustomDataGrid from "../../layouts/DataGrid";

import CrearRubrica from "./Ventanas/CrearRubrica";
import VerModificarRubrica from "./Ventanas/VerModificarRubrica";

export default function Rubricas() {
    
    const { enqueueSnackbar } = useSnackbar();


    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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
        try {
            const response = await fetch(`http://localhost:5000/comite/rubrica/${id}`, {
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
            const response = await fetch('http://localhost:5000/comite/obtenerRubricasAspectos', {
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
                    <Box width="100%" ml="10px" display="flex" justifyContent="center">
                        <Tooltip title="Ver aspecto">
                            <IconButton color="secondary" onClick={() => abrirVerModificarRubrica(row)}>
                                <Source />
                            </IconButton>

                        </Tooltip>
                        <Tooltip title="Eliminar Aspecto">
                            <IconButton color="secondary" onClick={() => eliminarRubrica(row.id)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }
    ]

    useEffect(() => {
        obtenerRubricas();
    }, []);


    return (
        <div>
            <AppBar position="static" color="transparent" variant="contained" >
                <Toolbar >
                    <Typography variant="h1" color={colors.secundary[100]} fontWeight="bold" sx={{ flexGrow: 1 }}>
                        RUBRICAS
                    </Typography>
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={abrirCrearRubrica}>
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
        </div>
    );
}
