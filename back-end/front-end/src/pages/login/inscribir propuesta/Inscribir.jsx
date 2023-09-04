import React, { useState, useEffect, useCallback } from "react";
import { Typography, Box, TextField, Grid, CssBaseline, Select, MenuItem, FormControl } from "@mui/material";
import "./Inscribir.css";
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Footer from "../../pie_de_pagina/Footer";
import { useSnackbar } from 'notistack';

export const Inscribir = () => {

    const navigate = useNavigate();
    const [deshabilitar, setDeshabilitar] = useState(true);
    const [nombre, setNombre] = useState("");
    const handleNombre = (e) => {
        setNombre(e.target.value);
    };

    const [nombreEmpresa, setNombreEmpresa] = useState("");
    const handleNombreEmpresa = (e) => {
        setNombreEmpresa(e.target.value);
    };

    const [correoEmpresa, setCorreoEmpresa] = useState("");
    const handleCorreoEmpresa = (e) => {
        setCorreoEmpresa(e.target.value);
    };

    const [nombreRepr, setNombreRepr] = useState("");
    const handleNombreRepr = (e) => {
        setNombreRepr(e.target.value);
    };

    const [estudiantes, setEstudiantes] = useState([
        { nombre: "", num_identificacion: "", correo: "" },
        { nombre: "", num_identificacion: "", correo: "" },
        { nombre: "", num_identificacion: "", correo: "" },
    ]);
    const handleEstudianteChange = (index, field, value) => {
        const newEstudiantes = [...estudiantes];
        newEstudiantes[index][field] = value;
        setEstudiantes(newEstudiantes);
    };

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [listaDirectores, setListaDirectores] = useState([]);
    const infoDirector = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/getDirectores", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setListaDirectores(data.directores);
            }

        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, []);

    const [consecutivo, setConsecutivo] = useState("");
    const codigoProy = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/codigoProy", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (data.codigo) {
                const currentConsecutivo = parseInt(data.codigo.split('-')[2], 10);
                const newConsecutivo = (currentConsecutivo + 1).toString().padStart(2, '0');
                setConsecutivo(newConsecutivo);
            }

        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, []);

    const [listaModalidades, setListaModalidades] = useState([]);
    const getModalidades = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/getModalidades", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setListaModalidades(data.modalidades);
            }

        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, []);

    useEffect(() => {
        infoDirector();
        codigoProy();
        getModalidades();
    }, [infoDirector, codigoProy, getModalidades]);

    const [idModalidadSeleccionada, setIdModalidadSeleccionada] = useState("");
    const handleModalidadSeleccionada = (event) => {
        if (event.target.value !== "") {
            setIdModalidadSeleccionada(event.target.value);
        } else {
            if (event.target.value === 3 || event.target.value === 4) {
                const updatedEstudiantes = [...estudiantes];
                updatedEstudiantes[1] = { nombre: "", num_identificacion: "", correo: "" };
                updatedEstudiantes[2] = { nombre: "", num_identificacion: "", correo: "" };
                setEstudiantes(updatedEstudiantes);
            }
            setIdModalidadSeleccionada("")
        }
    };

    const [idDirectorSeleccionado, setIdDirectorSeleccionado] = useState("");
    const handleDirectorSeleccionado = (event) => {
        if (event.target.value !== "") {
            setIdDirectorSeleccionado(event.target.value);
        } else {
            setIdDirectorSeleccionado("");
        }
    };

    const getFormattedDate = () => {
        const now = new Date();
        const year = now.getFullYear().toString();
        return `${year}`;
    };

    const generateCode = (consecutivo) => {
        const now = new Date();
        const formattedDate = getFormattedDate();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const periodo = getPeriodo(month);
        return `TEM_${formattedDate}-${periodo}-${consecutivo}`;
    };

    const getPeriodo = (month) => {
        if (month >= 1 && month <= 6) {
            return "01";
        } else {
            return "02";
        }
    };

    const terminar = async () => {
       
        const numIntegrantes = estudiantes.filter(estudiante => estudiante.nombre !== "" && estudiante.correo !== "" && estudiante.num_identificacion !== "").length;

        // Verificar el correo
        const emailRegex = /^\S+@unbosque\.edu\.co$/;
        const validEmails = estudiantes.filter((estudiante) => emailRegex.test(estudiante.correo));
        if (validEmails.length !== numIntegrantes) {
            mostrarMensaje("Ingrese una dirección de correo electrónico institucional válida.", "error");
        } else {

            // Verificar que el numero de identificacion no tenga caracteres especiales
            const idRegex = /^[a-zA-Z0-9]+$/;
            const validIds = estudiantes.filter((estudiante) => idRegex.test(estudiante.num_identificacion));
            if (validIds.length !== numIntegrantes) {
                mostrarMensaje("El número de identificación no es válido. Debe contener solo letras y/o dígitos.", "error");
            } else {

                // Código
                const codigoProyecto = generateCode(consecutivo);

                // Anio
                const now = new Date();
                const year = now.getFullYear().toString();

                // Periodo
                const periodo = getPeriodo(now.getMonth() + 1);

                // Insertar un nuevo proyecto
                try {
                    const response = await fetch("http://localhost:5000/inscribirPropuesta", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            codigo: codigoProyecto,
                            nombre: nombre,
                            anio: year,
                            periodo: periodo,
                            id_modalidad: parseInt(idModalidadSeleccionada),
                            id_etapa: 1,
                            id_estado: 1,
                            id_usuario: parseInt(idDirectorSeleccionado),
                            estudiantes: estudiantes,
                            nombre_empresa: nombreEmpresa,
                            correo_repr: correoEmpresa,
                            nombre_repr: nombreRepr
                        }),
                    });

                    const data = await response.json();
                    if (!data.success) {
                        mostrarMensaje(data.message, "error");
                    } else {
                        mostrarMensaje("El proyecto fue creado con éxito.", "success");
                        // Delay
                        setTimeout(() => {
                            navigate('/');
                        }, 2000);
                    }
                } catch (error) {
                    mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
                }
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setDeshabilitar(false)
        if (idModalidadSeleccionada === "" || idDirectorSeleccionado === "" || nombre === "") {
            mostrarMensaje("Por favor, complete todos los campos.", "error");

        } else {
            const numIntegrantes = estudiantes.filter(estudiante => estudiante.nombre !== "" && estudiante.correo !== "" && estudiante.num_identificacion !== "").length;
            // AUX o COT
            if (idModalidadSeleccionada === 3 || idModalidadSeleccionada === 4) {
                if (numIntegrantes === 1) {
                    terminar();

                } else {
                    mostrarMensaje("Proporcione la información completa del integrante antes de proceder.", "error");
                }
            } else {
                // DT o PG
                if (numIntegrantes >= 2 && numIntegrantes <= 3) {

                    if (idModalidadSeleccionada === 1 && (nombreEmpresa === '' || nombreRepr === '' || correoEmpresa === '')) {
                        mostrarMensaje("Proporcione la información completa de la empresa antes de proceder.", "error");

                    } else {
                        terminar();
                    }

                } else {
                    mostrarMensaje("Proporcione la información completa de los integrantes antes de proceder.", "error");
                }
            }
        }
        setDeshabilitar(true)
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <Box sx={{ flex: '1', paddingTop: 5, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
                <Typography
                    variant="h5"
                    color="secondary"
                    sx={{ mt: "20px", mb: "20px" }}
                >
                    Información General
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="h6" color="primary">
                            Modalidad
                        </Typography>
                        <Select
                            value={idModalidadSeleccionada || ""}
                            onChange={handleModalidadSeleccionada}
                            required
                            fullWidth
                        >
                            {listaModalidades.map((modalidad) => (
                                <MenuItem key={modalidad.id} value={modalidad.id}>
                                    {modalidad.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>

                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="h6" color="primary">
                            Director
                        </Typography>
                        <FormControl fullWidth>
                            <Select
                                value={idDirectorSeleccionado || ""}
                                required
                                fullWidth
                                onChange={handleDirectorSeleccionado}
                            >
                                {listaDirectores.map((listaDirectores) => (
                                    <MenuItem key={listaDirectores.id} value={listaDirectores.id}>
                                        {listaDirectores.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" color="primary">
                            Nombre del Proyecto
                        </Typography>
                        <TextField value={nombre} onChange={handleNombre} fullWidth />
                    </Grid>

                    {idModalidadSeleccionada === 1 && (
                        <>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Nombre Empresa
                                </Typography>
                                <TextField value={nombreEmpresa} onChange={handleNombreEmpresa} fullWidth />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Nombre Representante
                                </Typography>
                                <TextField value={nombreRepr} onChange={handleNombreRepr} fullWidth />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Correo Electrónico Representante
                                </Typography>
                                <TextField value={correoEmpresa} onChange={handleCorreoEmpresa} fullWidth />
                            </Grid>
                        </>
                    )}

                </Grid>

                <Typography
                    variant="h5"
                    color="secondary"
                    sx={{ mt: "30px", mb: "20px" }}
                >
                    Integrantes
                </Typography>
                <Grid container spacing={3}>

                    {idModalidadSeleccionada !== '' && (
                        <>
                            {(idModalidadSeleccionada === 3 || idModalidadSeleccionada === 4) && (
                                <>
                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Nombre Completo Integrante 1
                                        </Typography>
                                        <TextField value={estudiantes[0].nombre} onChange={(event) => handleEstudianteChange(0, 'nombre', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Número de Identificación Integrante 1
                                        </Typography>
                                        <TextField value={estudiantes[0].num_identificacion} onChange={(event) => handleEstudianteChange(0, 'num_identificacion', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Correo Electrónico Integrante 1
                                        </Typography>
                                        <TextField value={estudiantes[0].correo} onChange={(event) => handleEstudianteChange(0, 'correo', event.target.value)} fullWidth />
                                    </Grid>
                                </>
                            )}

                            {(idModalidadSeleccionada === 1 || idModalidadSeleccionada === 2) && (
                                <>
                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Nombre Completo Integrante 1
                                        </Typography>
                                        <TextField value={estudiantes[0].nombre} onChange={(event) => handleEstudianteChange(0, 'nombre', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Número de Identificación Integrante 1
                                        </Typography>
                                        <TextField value={estudiantes[0].num_identificacion} onChange={(event) => handleEstudianteChange(0, 'num_identificacion', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Correo Electrónico Integrante 1
                                        </Typography>
                                        <TextField value={estudiantes[0].correo} onChange={(event) => handleEstudianteChange(0, 'correo', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Nombre Completo Integrante 2
                                        </Typography>
                                        <TextField value={estudiantes[1].nombre} onChange={(event) => handleEstudianteChange(1, 'nombre', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Número de Identificación Integrante 2
                                        </Typography>
                                        <TextField value={estudiantes[1].num_identificacion} onChange={(event) => handleEstudianteChange(1, 'num_identificacion', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Correo Electrónico Integrante 2
                                        </Typography>
                                        <TextField value={estudiantes[1].correo} onChange={(event) => handleEstudianteChange(1, 'correo', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Nombre Completo Integrante 3
                                        </Typography>
                                        <TextField value={estudiantes[2].nombre} onChange={(event) => handleEstudianteChange(2, 'nombre', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Número de Identificación Integrante 3
                                        </Typography>
                                        <TextField value={estudiantes[2].num_identificacion} onChange={(event) => handleEstudianteChange(2, 'num_identificacion', event.target.value)} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Correo Electrónico Integrante 3
                                        </Typography>
                                        <TextField value={estudiantes[2].correo} onChange={(event) => handleEstudianteChange(2, 'correo', event.target.value)} fullWidth />
                                    </Grid>
                                </>
                            )}
                        </>
                    )}

                </Grid>

                <div style={{ justifyContent: 'center', display: 'flex', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '35%' }}>
                        <Button className="boton" onClick={handleBack}>
                            Atrás
                        </Button>
                        <Button className="boton" onClick={handleSubmit} disabled={!deshabilitar}>
                            Guardar
                        </Button>
                    </div>
                </div>

            </Box >

            <Footer />
        </div>
    );
};

export default Inscribir;
