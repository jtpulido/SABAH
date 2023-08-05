import React, { useState, useEffect, useCallback } from "react";

import { Typography, Box, TextField, Grid, CssBaseline, Checkbox, FormControlLabel } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

export default function Inicio() {

    const id = sessionStorage.getItem('user_id_usuario');
    const estadoRolDirector = JSON.parse(sessionStorage.getItem('estadoRolDirector'));
    const estadoRolLector = JSON.parse(sessionStorage.getItem('estadoRolLector'));
    const estadoRolJurado = JSON.parse(sessionStorage.getItem('estadoRolJurado'));

    const token = useSelector(selectToken);
    const [existe, setExiste] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [usuario, setUsuario] = useState({
        nombre: '',
        correo: '',
        estado: null
    });

    const infoUsuario = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/usuario/verUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
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
        infoUsuario();
    }, [infoUsuario]);

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