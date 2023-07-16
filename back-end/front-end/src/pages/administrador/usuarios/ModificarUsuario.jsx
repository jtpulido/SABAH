import React, { useState, useEffect, useCallback } from "react";

import { Typography, useTheme, Box, TextField, Grid, CssBaseline, Button } from "@mui/material";
import { tokens } from "../../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export default function ModificarUsuario() {

    const id = sessionStorage.getItem('admin_id_usuario');
    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const navigate = useNavigate();
    const [usuarioInicial, setUsuarioInicial] = useState([]);
    const [usuario, setUsuario] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario({ ...usuario, [name]: value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (usuario.nombre === "" || usuario.correo === "") {
            mostrarMensaje("Por favor, complete todos los campos.", "error");
        } else {

            if (!usuario.correo.match(/^\S+@unbosque\.edu\.co$/)) {
                mostrarMensaje("Por favor, ingresar una dirección de correo electrónico institucional válida.", "error");
            } else {

                if (!usuario.nombre.match(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s']+$/)) {
                    mostrarMensaje("El nombre ingresado contiene caracteres no permitidos. Por favor, ingrese solo letras (mayúsculas y minúsculas), espacios y algunos caracteres especiales como la letra 'ñ' y los acentos.", "error");
                } else {

                    // Verificar que no se hayan realizado modificaciones al usuario
                    const nombreInicial = usuarioInicial.nombre.trimEnd();
                    const nombreUsuario = usuario.nombre.trimEnd();
                    const areUsuariosIdenticos = nombreInicial === nombreUsuario;

                    const correoInicial = usuarioInicial.correo.trimEnd();
                    const correoUsuario = usuario.correo.trimEnd();
                    const areCorreosIdenticos = correoInicial === correoUsuario;

                    if (areUsuariosIdenticos && areCorreosIdenticos) {
                        mostrarMensaje("No se ha modificado la información del usuario.", "error");
                    } else {

                        try {
                            const response = await fetch("http://localhost:5000/admin/modificarUsuario", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ id: id, nombre: usuario.nombre, correo: usuario.correo })
                            });

                            const data = await response.json();

                            if (!data.success) {
                                mostrarMensaje(data.message, "error");
                            } else {
                                mostrarMensaje(data.message, "success");
                                // Delay
                                setTimeout(() => {
                                    navigate('/admin');
                                }, 2000);
                            }
                        }
                        catch (error) {
                            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
                        }
                    }
                }
            }
        }
    };

    const infoUsuario = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/verUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setUsuario(data.infoUsuario[0]);
                setUsuarioInicial(data.infoUsuario[0]);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [id, token]);

    useEffect(() => {
        infoUsuario();
    }, [infoUsuario]);

    return (
        <div style={{ margin: "15px" }} >

            <Typography
                variant="h1"
                color={colors.secundary[100]}
                fontWeight="bold"
            >
                MODIFICAR USUARIO
            </Typography>

            <Box >
                <CssBaseline />
                <Box >
                    <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "20px", mb: "20px" }}>
                        Información General
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Nombre Completo
                            </Typography>
                            <TextField name="nombre" id="nombre" type="text" value={usuario.nombre} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Correo Electrónico
                            </Typography>
                            <TextField name="correo" id="correo" type="text" value={usuario.correo} onChange={handleChange} fullWidth />
                        </Grid>
                    </Grid>

                    <Button sx={{
                        alignContent: 'center',
                        textAlign: 'center',
                        lineHeight: '28px',
                        width: '15%',
                        backgroundColor: '#8DB33A',
                        color: 'white',
                        border: 'none',
                        justifyContent: 'center',
                        margin: 'auto',
                        display: 'flex',
                        marginTop: '40px',
                        borderRadius: 0,
                    }} onClick={handleSubmit}>
                        Guardar
                    </Button>
                </Box>
            </Box>
        </div>
    );
}