import React, { useState, useEffect, useCallback } from "react";
import { Typography, Box, TextField, Grid, CssBaseline, Select } from "@mui/material";
import "./Inscribir.css";
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import Footer from "../../pie_de_pagina/Footer";
import { useSnackbar } from 'notistack';

export const Inscribir = () => {

    const [nombre, setNombre] = useState("");

    const handleNombre = (e) => {
        setNombre(e.target.value);
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
    }

    const navigate = useNavigate();

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

    const [idUltProy, setIdUltProy] = useState("");
    const getIdUltProy = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/getIdUltProy", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setIdUltProy(data.num);
            }

        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, []);

    // eslint-disable-next-line
    const [idUltEst, setIdUltEst] = useState("");
    const getIdUltEst = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/getIdUltEst", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setIdUltEst(data.num);
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
        getIdUltProy();
    }, [infoDirector, codigoProy, getModalidades, getIdUltProy]);

    const [idModalidadSeleccionada, setIdModalidadSeleccionada] = useState("");
    const handleModalidadSeleccionada = (event) => {
        if (event.target.value !== "") {
            setIdModalidadSeleccionada(event.target.value);
        } else {
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
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
    };

    const generateCode = (consecutivo) => {
        const formattedDate = getFormattedDate();
        return `TEM_${formattedDate}-${consecutivo}`;
    };

    const getPeriodo = (month) => {
        if (month >= 1 && month <= 6) {
            return "01";
        } else {
            return "02";
        }
    };

    const fechaSistema = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (idModalidadSeleccionada === "" || idDirectorSeleccionado === "" || nombre === "") {
            mostrarMensaje("Por favor, complete todos los campos.", "error");

        } else {
            // Verificar integrantes por modalidad
            const numIntegrantes = estudiantes.filter(estudiante => estudiante.nombre !== "" && estudiante.correo !== "" && estudiante.num_identificacion !== "").length;

            // AUX o COT
            if (idModalidadSeleccionada.acronimo === "AUX" || idModalidadSeleccionada.acronimo === "COT") {
                if (numIntegrantes === 1) {
                    // Verificar veracidad del correo
                    const emailRegex = /^\S+@unbosque\.edu\.co$/;
                    const validEmails = estudiantes.filter((estudiante) => emailRegex.test(estudiante.correo));
                    if (validEmails.length !== numIntegrantes) {
                        mostrarMensaje("Por favor, ingresar una dirección de correo electrónico institucional válida.", "error");
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

                            // Modalidad
                            const modInt = parseInt(idModalidadSeleccionada.id);

                            // Insertar un nuevo proyecto
                            try {
                                let response;
                                for (let index = 0; index < estudiantes.length; index++) {
                                    if (estudiantes[index].nombre !== "") {
                                        response = await fetch("http://localhost:5000/inscribirPropuesta", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                "id": parseInt(idUltProy) + 1,
                                                "codigo": codigoProyecto,
                                                "nombre": nombre,
                                                "anio": year,
                                                "periodo": periodo,
                                                "id_modalidad": modInt,
                                                "id_etapa": 1,
                                                "id_estado": 1,
                                                "fecha_asignacion": fechaSistema(),
                                                "id_usuario": parseInt(idDirectorSeleccionado),
                                                "nombreEstudiante": estudiantes[index].nombre.toString(),
                                                "num_identificacion": estudiantes[index].num_identificacion.toString(),
                                                "correo": estudiantes[index].correo.toString()
                                            }),
                                        });
                                    }
                                }

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

                } else {
                    mostrarMensaje("La modalidad 'Auxiliar de Investigación' y 'Coterminal' requieren un integrante con toda la información completa. Por favor asegúrese de llenar todos los campos requeridos antes de continuar.", "error");
                }
            } else {
                // DT o PG
                if (numIntegrantes >= 2 && numIntegrantes <= 3) {

                    // Verificar veracidad del correo
                    const emailRegex = /^\S+@unbosque\.edu\.co$/;
                    const validEmails = estudiantes.filter((estudiante) => emailRegex.test(estudiante.correo));
                    if (validEmails.length !== numIntegrantes) {
                        mostrarMensaje("Por favor, ingresar una dirección de correo electrónico institucional válida.", "error");
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

                            // Modalidad
                            const modInt = parseInt(idModalidadSeleccionada.id);

                            const estudiantesNoVacios = estudiantes.filter((estudiante) => {
                                return (
                                    estudiante.nombre !== "" &&
                                    estudiante.num_identificacion !== "" &&
                                    estudiante.correo !== ""
                                );
                            });

                            // Insertar un nuevo proyecto
                            try {
                                const response = await fetch("http://localhost:5000/inscribirPropuestaVarios", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        "id": parseInt(idUltProy) + 1,
                                        "codigo": codigoProyecto,
                                        "nombre": nombre,
                                        "anio": year,
                                        "periodo": periodo,
                                        "id_modalidad": modInt,
                                        "id_etapa": 1,
                                        "id_estado": 1,
                                        "fecha_asignacion": fechaSistema(),
                                        "id_usuario": parseInt(idDirectorSeleccionado),
                                        "infoEstudiantes": estudiantesNoVacios
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
                } else {
                    mostrarMensaje("La modalidad 'Desarrollo Tecnológico' y 'Proyecto de Grado' requieren de 2 a 3 integrantes con toda la información completa. Por favor asegúrese de llenar todos los campos requeridos antes de continuar.", "error");
                }
            }
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    return (
        <>
            <CssBaseline />

            <Box sx={{ height: '100%', paddingTop: 5, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>

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
                        <FormControl fullWidth>
                                <Select
                                    value={idModalidadSeleccionada ||""}
                                    onChange={handleModalidadSeleccionada}
                                    required
                                    fullWidth
                                >
                                    {listaModalidades.map((modalidad) => (
                                        <MenuItem key={modalidad.id} value={modalidad}>
                                            {modalidad.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        
                    </Grid>

                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="h6" color="primary">
                            Director
                        </Typography>
                        <Select
                            fullWidth
                            native
                            onChange={handleDirectorSeleccionado}
                            inputProps={{
                                name: "director",
                                id: "director",
                            }}
                        >
                            <option value="" />
                            {listaDirectores.map((listaDirectores) => (
                                <option key={listaDirectores.id} value={listaDirectores.id}>
                                    {listaDirectores.nombre}
                                </option>
                            ))}
                        </Select>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" color="primary">
                            Nombre del Proyecto
                        </Typography>
                        <TextField value={nombre} onChange={handleNombre} fullWidth />
                    </Grid>

                </Grid>

                <Typography
                    variant="h5"
                    color="secondary"
                    sx={{ mt: "30px", mb: "20px" }}
                >
                    Integrantes
                </Typography>

                <Grid container spacing={3}>

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

                </Grid>

                <div style={{ justifyContent: 'center', display: 'flex', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '35%' }}>
                        <Button className="boton" onClick={handleBack}>
                            Atrás
                        </Button>
                        <Button className="boton" onClick={handleSubmit}>
                            Guardar
                        </Button>
                    </div>
                </div>

            </Box>

            <Footer />
        </>
    );
};

export default Inscribir;
