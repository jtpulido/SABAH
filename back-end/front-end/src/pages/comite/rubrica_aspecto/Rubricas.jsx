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

    const [openCrear, setOpenCrear] = useState(false);
    const [openVer, setOpenVer] = useState(false);

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const openCrearRubrica = () => {
        setOpenCrear(true);
    };

    const cerrarCrearRubrica = () => {
        setOpenCrear(false);
        obtenerRubricas()
    }

    const openVerRubrica = () => {
        setOpenVer(true);
    };

    const cerrarVerRubrica = () => {
        setOpenVer(false);
        setRubrica({})
        obtenerRubricas()
    }
    const modificarRubrica = async (rubrica) => {
        setRubrica(rubrica)
        openVerRubrica()
    }

    const eliminarRubrica = async (id) => { }
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
                            <IconButton color="secondary" onClick={() => modificarRubrica(row)}>
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
                    <Button color="secondary" startIcon={<AddCircleOutline />} onClick={openCrearRubrica}>
                        Crear Rubrica
                    </Button>
                </Toolbar>
            </AppBar>

            <CrearRubrica
                open={openCrear}
                onClose={cerrarCrearRubrica}
            />
            <VerModificarRubrica 
            open={openVer}
                onClose={cerrarVerRubrica}
                rubrica={rubrica}
            />
            <CustomDataGrid rows={rubricas} columns={columnas} mensaje="No hay aspectos." />
        </div>
    );
}
