import React, { useState, useEffect, useCallback } from "react";

import { Typography, useTheme, Box, TextField, Grid, CssBaseline } from "@mui/material";
import { tokens } from "../../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';

export default function VerProyectos() {

    const id = sessionStorage.getItem('id_proyecto');
    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [existe, setExiste] = useState([]);
    const [proyecto, setProyecto] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [existeLector, setExisteLector] = useState([]);
    const [existeJurados, setExisteJurados] = useState([]);
    const [listaJurado, setListaJurado] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const infoProyecto = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/usuario/obtenerProyecto/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
                setExiste(false);
            } else {
                setProyecto(data.proyecto);
                setEstudiantes(data.estudiantes);
                setDirector(data.director);
                setExisteLector(data.lector.existe_lector);
                setLector(data.lector.existe_lector ? data.lector.nombre : "");
                setExisteJurados(data.jurados.existe_jurado);
                setListaJurado(data.jurados.existe_jurado ? data.jurados.jurados : []);
                setExiste(true);
            }
        }
        catch (error) {
            alert(error)
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
            setExiste(false);
        }
    }, [id, token, mostrarMensaje]);

    useEffect(() => {
        infoProyecto()
    }, [infoProyecto]);

    return (
        <div style={{ margin: "15px" }} >

            <div style={{ display: 'flex', marginBottom: "20px" }}>
                <Typography
                    variant="h1"
                    color="secondary"
                    fontWeight="bold"
                >
                    VER PROYECTO
                </Typography>

            </div>

            {existe ? (

                <Box >
                    <CssBaseline />

                    <Typography
                        variant="h4"
                        color="secondary"
                        sx={{ mb: "5px" }}
                    >
                        {proyecto.modalidad || ''}
                    </Typography >
                    <Typography
                        variant="h4"
                        sx={{ mb: "5px" }}
                    >
                        {proyecto.nombre || ''}
                    </Typography>
                    <Typography
                        variant="h4"
                    >
                        {proyecto.codigo || ''}
                    </Typography>
                    <Box >
                        <Typography variant="h6" color="secondary" sx={{ mt: "30px", mb: "10px" }}>
                            Información General
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xxs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color="primary">
                                    Modalidad
                                </Typography>
                                <TextField value={proyecto.modalidad || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color="primary">
                                    Etapa
                                </Typography>
                                <TextField value={proyecto.etapa || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color="primary">
                                    Estado
                                </Typography>
                                <TextField value={proyecto.estado || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color="primary">
                                    Año
                                </Typography>
                                <TextField value={proyecto.anio || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color="primary">
                                    Período
                                </Typography>
                                <TextField value={proyecto.periodo || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color="primary">
                                    Director
                                </Typography>
                                <TextField value={director.nombre || ''} fullWidth />
                            </Grid>

                            {proyecto.acronimo !== "AUX" && (
                                <>
                                    <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                        <Typography variant="h6" color="primary">Lector</Typography>
                                        {existeLector ? (
                                            <TextField value={lector || ''} fullWidth />
                                        ) : (
                                            <TextField value="No se ha asignado el lector" fullWidth></TextField>

                                        )}

                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="h6" color="secondary" sx={{ mt: "30px", mb: "10px" }}>
                            Estudiante(s)
                        </Typography>

                        <Grid container>
                            {estudiantes.map((estudiante) => (
                                <Grid item key={estudiante.num_identificacion} xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xxs={12} sm={6} md={4} lg={4} xl={4}>
                                            <Typography variant="h6" color="primary">
                                                Nombre Completo
                                            </Typography>
                                            <TextField
                                                value={estudiante.nombre || ''}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                            <Typography variant="h6" color="primary">
                                                Correo Electrónico
                                            </Typography>
                                            <TextField
                                                value={estudiante.correo || ''}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                            <Typography variant="h6" color="primary">
                                                Número de Identificación
                                            </Typography>
                                            <TextField
                                                value={estudiante.num_identificacion || ''}
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>

                        {proyecto.acronimo !== "AUX" && proyecto.modalidad !== "Coterminal" && (
                            <>
                                <Box>
                                    <Typography variant="h6" color="secondary" sx={{ mt: "30px", mb: "10px" }}>
                                        Jurado(s)
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {existeJurados ? (
                                            listaJurado.map((jurado, index) => (
                                                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={index}>
                                                    <Typography variant="h6" color="primary">Nombre Completo</Typography>
                                                    <TextField value={jurado?.nombre || ''} fullWidth />
                                                </Grid>
                                            ))
                                        ) : (
                                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                                <Typography variant="h6" color="primary">Nombre Completo</Typography>
                                                <TextField value="No se ha asignado ningún jurado" fullWidth />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </>
                        )}

                    </Box>

                </Box>
            ) : (
                <Typography variant="h6" color="primary">{mostrarMensaje.mensaje}</Typography>
            )}
        </div>
    );
}