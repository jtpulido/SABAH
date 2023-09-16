import React, { useState, useEffect, useCallback } from "react";

import { Typography, Box, TextField, Grid, CssBaseline, Checkbox, FormControlLabel } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

export default function Inicio() {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const id = sessionStorage.getItem('user_id_usuario');

    const token = useSelector(selectToken);
    const [existe, setExiste] = useState([]);
    const [estadoRolDirector, setEstadoRolDirector] = useState(null);
    const [estadoRolLector, setEstadoRolLector] = useState(null);
    const [estadoRolJurado, setEstadoRolJurado] = useState(null);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [usuario, setUsuario] = useState({
        nombre: '',
        correo: '',
        estado: null
    });

    useEffect(() => {
        const obtenerRoles = async () => {
            const idUsuario = id;
            try {
                const responseDirector = await fetch(`${apiBaseUrl}/usuario/rolDirector/${idUsuario}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                });

                const responseLector = await fetch(`${apiBaseUrl}/usuario/rolLector/${idUsuario}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                });

                const responseJurado = await fetch(`${apiBaseUrl}/usuario/rolJurado/${idUsuario}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                });

                const dataDirector = await responseDirector.json();
                const dataLector = await responseLector.json();
                const dataJurado = await responseJurado.json();

                if (!dataDirector.success) {
                    sessionStorage.setItem('estadoRolDirector', false.toString());
                    setEstadoRolDirector(false);
                } else {
                    sessionStorage.setItem('estadoRolDirector', true.toString());
                    setEstadoRolDirector(true);
                }

                if (!dataLector.success) {
                    sessionStorage.setItem('estadoRolLector', false.toString());
                    setEstadoRolLector(false);
                } else {
                    sessionStorage.setItem('estadoRolLector', true.toString());
                    setEstadoRolLector(true);
                }

                if (!dataJurado.success) {
                    setEstadoRolJurado(false);
                    sessionStorage.setItem('estadoRolJurado', false.toString());
                } else {
                    setEstadoRolJurado(true);
                    sessionStorage.setItem('estadoRolJurado', true.toString());
                }
            } catch (error) { }
        };

        obtenerRoles();
    }, [id, token]);

    const infoUsuario = useCallback(async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/usuario/verUsuario/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
                setExiste(false);
            } else {
                setUsuario(data.infoUsuario[0]);
                setExiste(true);
            }
        }
        catch (error) {
            setExiste(false);
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [id, token]);

    useEffect(() => {
        if (estadoRolDirector !== null || estadoRolLector !== null || estadoRolJurado !== null) {
            infoUsuario();
        }
    }, [infoUsuario, estadoRolDirector, estadoRolLector, estadoRolJurado]);

    return (
        <div style={{ margin: "15px" }} >

            <div style={{ display: 'flex', marginBottom: "20px" }}>
                <Typography
                    variant="h1"
                    color="secondary"
                    fontWeight="bold"
                >
                    BIENVENIDO AL SISTEMA SABAH
                </Typography>
            </div>

            {existe ? (
                <Box >
                    <CssBaseline />
                    <Box >
                        <Typography variant="h6" color="secondary" sx={{ mt: "20px", mb: "20px" }}>
                            Información General
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Nombre Completo
                                </Typography>
                                <TextField value={usuario.nombre || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Correo Electrónico
                                </Typography>
                                <TextField value={usuario.correo || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Estado
                                </Typography>
                                <TextField value={(usuario.estado === null ? '' : (usuario.estado ? 'Habilitado' : 'Inhabilitado')) || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={8} lg={6}>
                                <Typography variant="h6" color="primary">
                                    Roles
                                </Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={estadoRolDirector} />}
                                    label="Director"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={estadoRolLector} />}
                                    label="Lector"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={estadoRolJurado} />}
                                    label="Jurado"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                </Box>
            ) : (
                <Typography variant="h6" color="primary">{mostrarMensaje.mensaje}</Typography>
            )}
        </div>
    );
}