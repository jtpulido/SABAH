import React, { useState, useEffect } from "react";
import './VerProyecto.css';

import { useParams } from 'react-router-dom';
import { Typography, useTheme, Alert, Snackbar, Box, TextField, Grid, CssBaseline, Button, Select } from "@mui/material";
import { tokens } from "../../../theme";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";

import { useNavigate } from 'react-router-dom';

export default function ModificarProyectos() {

    const { id } = useParams();
    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const navigate = useNavigate();

    // Variable del SnackBar
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const handleCloseMensaje = () => setMensaje({ tipo: "", texto: "" });

    const [existe, setExiste] = useState([]);
    const [proyecto, setProyecto] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [existeLector, setExisteLector] = useState([]);
    const [existeJurados, setExisteJurados] = useState([]);
    const [listaJurado, setListaJurado] = useState([]);

    const [directorInicial, setDirectorInicial] = useState([]);
    const [proyectoModificado, setProyectoModificado] = useState([]);
    const [lectorModificado, setLectorModificado] = useState([]);
    const [juradosSeleccionados, setJuradosSeleccionados] = useState([]);
    const [estudiantesModificados, setEstudiantesModificados] = useState([]);
    const [estadoVisible, setEstadoVisible] = useState(true);

    const infoProyecto = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/verProyecto", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();
            if (!data.success) {
                setMensaje({ tipo: "error", texto: data.message });
                setExiste(false)
            } else {
                setProyecto(data.proyecto);
                setProyectoModificado(data.proyecto);
                setEstudiantes(data.estudiantes);
                setDirector(data.director);
                setDirectorInicial(data.director);
                setExisteLector(data.lector.existe_lector);
                setLector(data.lector.existe_lector ? data.lector.nombre : "");
                setLectorModificado(data.lector.existe_lector ? data.lector.nombre : "");
                setExisteJurados(data.jurados.existe_jurado);
                setListaJurado(data.jurados.existe_jurado ? data.jurados.jurados : []);
                setJuradosSeleccionados(data.jurados.existe_jurado ? data.jurados.jurados : []);
                setExiste(true);
                setEstudiantesModificados(data.estudiantes);
            }
        }
        catch (error) {
            setExiste(false)
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
        }
    };

    // Lista de todos los usuarios con tipo usuario normal
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const infoUsuario = async () => {
        try {
            const response = await fetch("http://localhost:5000/getDirectores", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (!data.success) {
                setMensaje({ tipo: "error", texto: data.message });
            } else {
                setListaUsuarios(data.directores);
            }
        } catch (error) {
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
        }
    };

    // Lista de todas las modalidades de la base de datos
    const [listaModalidades, setListaModalidades] = useState([]);
    const getModalidades = async () => {
        try {
            const response = await fetch("http://localhost:5000/getModalidades", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (!data.success) {
                setMensaje({ tipo: "error", texto: data.message });
            } else {
                setListaModalidades(data.modalidades);
            }
        } catch (error) {
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
        }
    };

    // Lista de todos los estados de la base de datos
    const [listaEstados, setListaEstados] = useState([]);
    const getEstados = async () => {
        try {
            const response = await fetch("http://localhost:5000/getEstados", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (!data.success) {
                setMensaje({ tipo: "error", texto: data.message });
            } else {
                setListaEstados(data.estados);
            }
        } catch (error) {
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
        }
    };

    // Lista de todas las etapas de la base de datos
    const [listaEtapas, setListaEtapas] = useState([]);
    const getEtapas = async () => {
        try {
            const response = await fetch("http://localhost:5000/getEtapas", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (!data.success) {
                setMensaje({ tipo: "error", texto: data.message });
            } else {
                setListaEtapas(data.etapas);
            }
        } catch (error) {
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
        }
    };

    useEffect(() => {
        infoProyecto()
        infoUsuario()
        getModalidades()
        getEstados()
        getEtapas()
        setProyectoModificado(proyecto)
        setEstudiantesModificados(estudiantes)
        setLectorModificado(lector)
    }, []);

    // Cambia solo el id del director
    const handleDirectorSeleccionado = (e) => {
        const { value } = e.target;
        setDirector({ ...director, id: value });
    };

    const handleModalidadChange = (e) => {
        const { value } = e.target;
        setProyectoModificado({ ...proyectoModificado, modalidad: value });
        setEstadoVisible(value === "Coterminal");
    };

    const handleEtapaChange = (e) => {
        const { value } = e.target;
        setProyectoModificado({ ...proyectoModificado, etapa: value });
    };

    const handleEstadoChange = (e) => {
        const { value } = e.target;
        setProyectoModificado({ ...proyectoModificado, estado: value });
    };

    const handlePeriodoChange = (e) => {
        const { value } = e.target;
        setProyectoModificado({ ...proyectoModificado, periodo: value });
    };

    const handleAnioChange = (e) => {
        const { value } = e.target;
        setProyectoModificado({ ...proyectoModificado, anio: value });
    };

    // Se cambia el valor del id del lector
    const handleLectorChange = (e) => {
        const { value } = e.target;

        if (value === '' && lectorModificado.length === 1) {
            setLectorModificado([]);
        } else {
            setLectorModificado(value);
        }
    };

    const handleJuradoSeleccionado = (event, index) => {
        const selectedJuradoId = event.target.value;
        const selectedJurado = listaUsuarios.find((usuario) => usuario.id === parseInt(selectedJuradoId));

        setJuradosSeleccionados((prevJurados) => {
            const updatedJurados = [...prevJurados];

            if (selectedJuradoId === '') {
                updatedJurados.splice(index, 1);
            } else {
                updatedJurados[index] = selectedJurado;
            }

            return updatedJurados;
        });
    };

    const handleEstudianteChange = (event, index, campo) => {
        const newValue = event.target.value;

        setEstudiantesModificados((prevEstudiantes) => {
            const updatedEstudiantes = [...prevEstudiantes];
            const estudiante = { ...updatedEstudiantes[index] };

            estudiante[campo] = newValue;
            updatedEstudiantes[index] = estudiante;

            // Verificar si los campos están vacíos
            const { nombre, correo, num_identificacion } = estudiante;
            const fieldsEmpty = !nombre && !correo && !num_identificacion;

            // Eliminar el estudiante si los campos están vacíos
            if (fieldsEmpty) {
                updatedEstudiantes.splice(index, 1);
            }
            return updatedEstudiantes;
        });
    };

    const fechaSistema = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    };

    const compararEstudiantes = () => {
        let valor = true;
        if (estudiantes.length !== estudiantesModificados.length) {
            valor = false;
        } else {
            for (let i = 0; i < estudiantes.length; i++) {
                if (estudiantes[i].nombre !== estudiantesModificados[i].nombre || estudiantes[i].correo !== estudiantesModificados[i].correo || estudiantes[i].num_identificacion !== estudiantesModificados[i].num_identificacion) {
                    valor = false;
                }
            }
        }
        return valor;
    };

    const esperar = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const cambiosFinales = async () => {

        // Comparación listas jurados
        const compareLists = (listaJurado, juradosSeleccionados) => {
            if (listaJurado.length !== juradosSeleccionados.length) {
                return false;
            }

            const sortedList1 = listaJurado.sort((a, b) => a.id - b.id);
            const sortedList2 = juradosSeleccionados.sort((a, b) => a.id - b.id);

            return sortedList1.every((item, index) => item.id === sortedList2[index].id);
        };

        // Verificar si se hicieron cambios en la informacion de estudiantes
        const resultComprarEst = compararEstudiantes();

        // Verificar que toda la informacion de los estudiantes este completa
        const allFieldsComplete = estudiantesModificados.every((estudiante) => {
            return estudiante.nombre && estudiante.correo && estudiante.num_identificacion;
        });

        // Proyecto
        if (proyecto !== proyectoModificado) {

            // Verificar que el año este bien
            const regex = /^(202[0-9]|20[3-9]\d|2[1-9]\d{2}|[3-9]\d{3}|[1-9]\d{4,})$/;
            if (regex.test(proyectoModificado.anio)) {
                try {
                    const response = await fetch("http://localhost:5000/admin/modificarProyecto", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            id: parseInt(id),
                            modalidad: proyectoModificado.modalidad,
                            etapa: proyectoModificado.etapa,
                            estado: proyectoModificado.estado,
                            anio: proyectoModificado.anio,
                            periodo: proyectoModificado.periodo
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        setMensaje({ tipo: "error", texto: data.message });
                    } else {
                        setMensaje({ tipo: "success", texto: "El proyecto ha sido modificado exitosamente." });
                        await esperar(2800);
                    }
                }
                catch (error) {
                    setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
            } else {
                setMensaje({ tipo: "error", texto: "El año ingresado no es válido." });
            }
        }

        // Director
        if (director.id !== directorInicial.id) {

            // Cambiar el estado a false del anterior director
            try {
                const response = await fetch("http://localhost:5000/admin/modificarUsuarioRol", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        id: parseInt(id),
                        id_usuario: parseInt(directorInicial.id)
                    })
                });
                const data = await response.json();
                if (!data.success) {
                    setMensaje({ tipo: "error", texto: data.message });
                } else {

                    // Agregar el nuevo director con fecha de asignacion actual
                    try {
                        const response = await fetch("http://localhost:5000/admin/agregarUsuarioRol", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                estado: true,
                                fecha_asignacion: fechaSistema(),
                                id_usuario: parseInt(director.id),
                                id_rol: 1,
                                id_proyecto: parseInt(id)
                            })
                        });

                        const data = await response.json();

                        if (!data.success) {
                            setMensaje({ tipo: "error", texto: data.message });

                        } else {
                            setMensaje({ tipo: "success", texto: "El director ha sido modificado exitosamente." });
                            await esperar(2800);
                        }
                    } catch (error) {
                        setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                    }
                }
            } catch (error) {
                setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
            }
        }

        // Lector

        // Crear nuevo lector
        if (!existeLector && lector !== lectorModificado) {

            try {
                const response = await fetch("http://localhost:5000/admin/agregarLector", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        estado: true,
                        fecha_asignacion: fechaSistema(),
                        id_rol: 2,
                        id_proyecto: parseInt(id),
                        nombre_usuario: lectorModificado
                    })
                });

                const data = await response.json();
                if (!data.success) {
                    setMensaje({ tipo: "error", texto: data.message });

                } else {
                    setMensaje({ tipo: "success", texto: "El lector ha sido agregado exitosamente." });
                    await esperar(2800);
                }
            } catch (error) {
                setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
            }

            // Modificar anterior (estado a false) y crear uno nuevo
        } else if (existeLector && lector !== lectorModificado) {

            if (lectorModificado !== '') {
                try {
                    const response = await fetch("http://localhost:5000/admin/modificarLector", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            id: parseInt(id),
                            nombre_usuario: lector
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        setMensaje({ tipo: "error", texto: data.message });
                    } else {

                        // Agregar el nuevo lector
                        try {
                            const response = await fetch("http://localhost:5000/admin/agregarLector", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({
                                    estado: true,
                                    fecha_asignacion: fechaSistema(),
                                    id_rol: 2,
                                    id_proyecto: parseInt(id),
                                    nombre_usuario: lectorModificado
                                })
                            });

                            const data = await response.json();
                            if (!data.success) {
                                setMensaje({ tipo: "error", texto: data.message });

                            } else {
                                setMensaje({ tipo: "success", texto: "El lector ha sido agregado exitosamente." });
                                await esperar(2800);
                            }
                        } catch (error) {
                            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                        }
                    }
                } catch (error) {
                    setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
            } else {
                setMensaje({ tipo: "error", texto: "Por favor seleccionar un valor válido para el lector." });
            }
        }

        // Jurado(s)

        // Añadir jurado(s) ya que hay un cambio
        if (!existeJurados && juradosSeleccionados.length === 2 && (juradosSeleccionados[0].id === juradosSeleccionados[1].id)) {
            setMensaje({ tipo: "error", texto: "No se puede seleccionar el mismo jurado más de una vez." });

        } else if (!existeJurados && juradosSeleccionados.length !== 0) {

            // Agregar cada jurado
            for (let index = 0; index < juradosSeleccionados.length; index++) {

                try {
                    const response = await fetch("http://localhost:5000/admin/agregarUsuarioRol", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            estado: true,
                            fecha_asignacion: fechaSistema(),
                            id_usuario: parseInt(juradosSeleccionados[index].id),
                            id_rol: 3,
                            id_proyecto: parseInt(id)
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        setMensaje({ tipo: "error", texto: data.message });

                    } else {
                        setMensaje({ tipo: "success", texto: "El jurado ha sido agregado exitosamente." });
                        await esperar(2800);
                    }
                } catch (error) {
                    setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
            }

        } else if (juradosSeleccionados.length === 2 && (juradosSeleccionados[0].id === juradosSeleccionados[1].id)) {
            setMensaje({ tipo: "error", texto: "No se puede seleccionar el mismo jurado más de una vez." });

        } else if (existeJurados && !compareLists(juradosSeleccionados, listaJurado)) {

            const juradosEliminados = listaJurado.filter(jurado => !juradosSeleccionados.includes(jurado));
            const nuevosJurados = juradosSeleccionados.filter(jurado => !listaJurado.includes(jurado));

            // Cambiar estado a false a los eliminados
            for (let index = 0; index < juradosEliminados.length; index++) {

                try {
                    const response = await fetch("http://localhost:5000/admin/modificarLector", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            id: parseInt(id),
                            nombre_usuario: juradosEliminados[index].nombre
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        setMensaje({ tipo: "error", texto: data.message });

                    } else {
                        setMensaje({ tipo: "success", texto: "El anterior jurado ha sido eliminado exitosamente." });
                        await esperar(2800);
                    }
                } catch (error) {
                    setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
            }

            // Agregar los nuevos jurados
            for (let index = 0; index < nuevosJurados.length; index++) {

                try {
                    const response = await fetch("http://localhost:5000/admin/agregarLector", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            estado: true,
                            fecha_asignacion: fechaSistema(),
                            id_rol: 3,
                            id_proyecto: parseInt(id),
                            nombre_usuario: nuevosJurados[index].nombre
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        setMensaje({ tipo: "error", texto: data.message });

                    } else {
                        setMensaje({ tipo: "success", texto: "El jurado ha sido agregado exitosamente." });
                        await esperar(2800);
                    }
                } catch (error) {
                    setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                }
            }
        }

        // Estudiantes
        if (resultComprarEst === false) {
            // Verificar que toda la informacion esta completa
            if (allFieldsComplete === true) {

                // Verificar correos, nombres y id

                // Verificar veracidad del correo
                const emailRegex = /^\S+@unbosque\.edu\.co$/;
                const validEmails = estudiantesModificados.filter((estudiante) => emailRegex.test(estudiante.correo));
                if (validEmails.length !== estudiantesModificados.length) {
                    setMensaje({ tipo: "error", texto: "Por favor, ingresar solamente correos electrónicos institucionales válidos." });
                } else {

                    // Verificar que el numero de identificacion no tenga caracteres especiales
                    const idRegex = /^[a-zA-Z0-9]+$/;
                    const validIds = estudiantesModificados.filter((estudiante) => idRegex.test(estudiante.num_identificacion));
                    if (validIds.length !== estudiantesModificados.length) {
                        setMensaje({ tipo: "error", texto: "El número de identificación no es válido. Debe contener solo letras y/o dígitos." });
                    } else {

                        const estudiantesEliminados = estudiantes.filter(estudiante => !estudiantesModificados.includes(estudiante));
                        const nuevosEstudiantes = estudiantesModificados.filter(estudiante => !estudiantes.includes(estudiante));

                        // Cambiar estado a false a los estudiantes eliminados
                        for (let index = 0; index < estudiantesEliminados.length; index++) {
                            const nombreAUX = estudiantesEliminados[index].nombre;
                            const correoAUX = estudiantesEliminados[index].correo;
                            const idAUX = estudiantesEliminados[index].num_identificacion;
                            try {
                                const response = await fetch("http://localhost:5000/admin/eliminarEstudiante", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({ nombre: nombreAUX, num_identificacion: idAUX, correo: correoAUX })
                                });

                                const data = await response.json();
                                if (!data.success) {
                                    setMensaje({ tipo: "error", texto: data.message });
                                } else {
                                    try {
                                        const response = await fetch("http://localhost:5000/admin/modificarEstudianteProyecto", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({
                                                id_proyecto: parseInt(id),
                                                nombre_estudiante: estudiantesEliminados[index].nombre
                                            })
                                        });

                                        const data = await response.json();
                                        if (!data.success) {
                                            setMensaje({ tipo: "error", texto: data.message });

                                        } else {
                                            setMensaje({ tipo: "success", texto: "El estudiante ha sido eliminado exitosamente." });
                                            await esperar(2800);
                                        }
                                    } catch (error) {
                                        setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                                    }
                                }
                            } catch (error) {
                                setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                            }
                        }

                        // Agregar los nuevos estudiantes
                        for (let index = 0; index < nuevosEstudiantes.length; index++) {

                            try {
                                const response = await fetch("http://localhost:5000/admin/agregarEstudiante", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({
                                        nombre: nuevosEstudiantes[index].nombre,
                                        num_identificacion: nuevosEstudiantes[index].num_identificacion,
                                        correo: nuevosEstudiantes[index].correo
                                    })
                                });

                                const data = await response.json();
                                if (!data.success) {
                                    setMensaje({ tipo: "error", texto: data.message });
                                } else {
                                    try {
                                        const response = await fetch("http://localhost:5000/admin/agregarEstudianteProyecto", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({
                                                id_proyecto: parseInt(id),
                                                nombre_estudiante: nuevosEstudiantes[index].nombre.toString()
                                            })
                                        });

                                        const data = await response.json();
                                        if (!data.success) {
                                            setMensaje({ tipo: "error", texto: data.message });

                                        } else {
                                            setMensaje({ tipo: "success", texto: "El estudiante ha sido agregado exitosamente." });
                                            await esperar(2800);
                                        }
                                    } catch (error) {
                                        setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                                    }
                                }
                            } catch (error) {
                                setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
                            }
                        }
                    }
                }
            } else {
                setMensaje({ tipo: "error", texto: "Por favor, ingrese toda la información de los estudiantes" });
            }
        }

        navigate('/admin/proyectos');
    };

    const prueba = async () => {

        try {
            const response = await fetch("http://localhost:5000/admin/prueba", {
                method: "DELETE",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id_proyecto: 2
                })
            });

            const data = await response.json();
            if (!data.success) {
                setMensaje({ tipo: "error", texto: data.message });

            } else {
                setMensaje({ tipo: "success", texto: "Funciona prueba." });
                await esperar(2800);
            }

        } catch (error) {
            setMensaje({ tipo: "error", texto: "Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda." });
        }

    };

    const handleSubmit = async () => {

        // Comparación listas jurados
        const compareLists = (listaJurado, juradosSeleccionados) => {
            if (listaJurado.length !== juradosSeleccionados.length) {
                return false;
            }
            const sortedList1 = listaJurado.sort((a, b) => a.id - b.id);
            const sortedList2 = juradosSeleccionados.sort((a, b) => a.id - b.id);
            return sortedList1.every((item, index) => item.id === sortedList2[index].id);
        };

        // Verificar si se hicieron cambios en la informacion de estudiantes
        const resultComprarEst = compararEstudiantes();

        // Verificar que toda la informacion de los estudiantes este completa
        const allFieldsComplete = estudiantesModificados.every((estudiante) => {
            return estudiante.nombre && estudiante.correo && estudiante.num_identificacion;
        });

        // Verificar si se modificó al información general del proyecto
        if (proyecto !== proyectoModificado || director !== directorInicial || lector !== lectorModificado || compareLists(juradosSeleccionados, listaJurado) === false || resultComprarEst === false) {

            // Verificar modalidad respecto al número de estudiantes
            // AUX o COT
            if (allFieldsComplete === true && (proyectoModificado.modalidad === 'Auxiliar de Investigación' || proyectoModificado.modalidad === 'Coterminal')) {
                if (estudiantesModificados.length === 1) {
                    cambiosFinales();
                } else {
                    setMensaje({ tipo: "error", texto: "La modalidad 'Auxiliar de Investigación' o 'Coterminal' requiere un integrante con toda la información completa. Por favor asegúrese de llenar todos los campos requeridos antes de continuar." })
                }

                // DT o PG
            } else if (allFieldsComplete === true && (proyectoModificado.modalidad === 'Desarrollo Tecnológico' || proyectoModificado.modalidad === 'Innovación Tecnológica')) {
                if (estudiantesModificados.length >= 2 && estudiantesModificados.length <= 3) {
                    cambiosFinales();
                } else {
                    setMensaje({ tipo: "error", texto: "La modalidad 'Desarrollo Tecnológico' y 'Proyecto de Grado' requieren de 2 a 3 integrantes con toda la información completa. Por favor asegúrese de llenar todos los campos requeridos antes de continuar." })
                }

            } else {
                setMensaje({ tipo: "error", texto: "Por favor, complete toda la información del proyecto." });
            }
        } else {
            setMensaje({ tipo: "error", texto: "No se ha modificado ninguna información del proyecto." });
        }

    };

    return (
        <div style={{ margin: "15px" }} >
            {mensaje.texto && (
                <Snackbar
                    open={true}
                    autoHideDuration={2500}
                    onClose={handleCloseMensaje}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity={mensaje.tipo} onClose={handleCloseMensaje}>
                        {mensaje.texto}
                    </Alert>
                </Snackbar>
            )}

            <div style={{ display: 'flex', marginBottom: "20px" }}>
                <Typography
                    variant="h1"
                    color={colors.secundary[100]}
                    fontWeight="bold"
                >
                    MODIFICAR PROYECTO
                </Typography>

            </div>

            {existe ? (

                <Box >
                    <CssBaseline />

                    <Typography
                        variant="h4"
                        color={colors.secundary[100]}
                        sx={{ mb: "5px" }}
                    >
                        {proyecto.modalidad || ''}
                    </Typography>
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
                        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "30px", mb: "10px" }}>
                            Información General
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Modalidad
                                </Typography>
                                <Select
                                    fullWidth
                                    native
                                    onChange={handleModalidadChange}
                                    inputProps={{
                                        name: "modalidad",
                                        id: "modalidad",
                                    }}
                                >
                                    {listaModalidades.map((listaModalidades) => (
                                        <option
                                            key={listaModalidades.id}
                                            value={listaModalidades.nombre}
                                            selected={listaModalidades.nombre === proyecto.modalidad}
                                        >
                                            {listaModalidades.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Etapa
                                </Typography>

                                <Select
                                    fullWidth
                                    native
                                    onChange={handleEtapaChange}
                                    inputProps={{
                                        name: "etapas",
                                        id: "etapas",
                                    }}
                                >
                                    {listaEtapas
                                        .filter((etapa) => proyectoModificado.modalidad !== "Coterminal" ||
                                            (etapa.nombre !== "Proyecto de grado 1" && etapa.nombre !== "Proyecto de grado 2"))
                                        .map((etapa) => (
                                            <option
                                                key={etapa.id}
                                                value={etapa.nombre}
                                                selected={etapa.nombre === proyecto.etapa}
                                            >
                                                {etapa.nombre}
                                            </option>
                                        ))}
                                </Select>

                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Estado
                                </Typography>

                                <Select
                                    fullWidth
                                    native
                                    onChange={handleEstadoChange}
                                    inputProps={{
                                        name: "estados",
                                        id: "estados",
                                    }}
                                >
                                    {listaEstados
                                        .filter((estado) => proyectoModificado.modalidad === "Coterminal" ||
                                            estado.nombre !== "Aprobado Comité")
                                        .map((estado) => (
                                            <option
                                                key={estado.id}
                                                value={estado.nombre}
                                                selected={estado.nombre === proyecto.estado}
                                            >
                                                {estado.nombre}
                                            </option>
                                        ))}
                                </Select>

                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Año
                                </Typography>
                                <TextField value={proyectoModificado.anio} fullWidth onChange={handleAnioChange} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Período
                                </Typography>
                                <Select
                                    fullWidth
                                    native
                                    onChange={handlePeriodoChange}
                                    inputProps={{
                                        name: "periodo",
                                        id: "periodo",
                                    }}
                                >
                                    <option value="01" selected={proyecto.periodo === "01"}>01</option>
                                    <option value="02" selected={proyecto.periodo === "02"}>02</option>
                                </Select>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
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
                                    {listaUsuarios.map((usuario) => (
                                        <option
                                            key={usuario.id}
                                            value={usuario.id}
                                            selected={usuario.nombre === director.nombre}
                                        >
                                            {usuario.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "30px", mb: "10px" }}>
                            Estudiante(s)
                        </Typography>

                        <Grid container spacing={2}>
                            {[...Array(3)].map((_, index) => {
                                return (
                                    <Grid item key={index} xs={12}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                                <Typography variant="h6" color={colors.primary[100]}>
                                                    Nombre Completo
                                                </Typography>
                                                <TextField value={estudiantesModificados[index]?.nombre || ''}
                                                    fullWidth
                                                    onChange={(event) => handleEstudianteChange(event, index, 'nombre')} />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                                <Typography variant="h6" color={colors.primary[100]}>
                                                    Correo Electrónico
                                                </Typography>
                                                <TextField value={estudiantesModificados[index]?.correo || ''}
                                                    fullWidth
                                                    onChange={(event) => handleEstudianteChange(event, index, 'correo')} />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                                <Typography variant="h6" color={colors.primary[100]}>
                                                    Número de Identificación
                                                </Typography>
                                                <TextField value={estudiantesModificados[index]?.num_identificacion || ''}
                                                    fullWidth
                                                    onChange={(event) => handleEstudianteChange(event, index, 'num_identificacion')} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>

                    {proyecto.acronimo !== "AUX" && (
                        <> <Box>

                            <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "30px", mb: "10px" }}>
                                Jurado(s)
                            </Typography>

                            <Grid container spacing={2}>
                                {[...Array(2)].map((_, index) => {
                                    const jurado = listaJurado[index] || {};

                                    return (
                                        <Grid item key={index} xs={12}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                                    <Typography variant="h6" color={colors.primary[100]}>
                                                        Nombre Completo
                                                    </Typography>
                                                    <Select
                                                        fullWidth
                                                        native
                                                        onChange={(event) => handleJuradoSeleccionado(event, index)}
                                                        inputProps={{
                                                            name: "jurado",
                                                            id: "jurado",
                                                        }}
                                                    >
                                                        <option value="" />
                                                        {listaUsuarios
                                                            .filter((usuario) => usuario.nombre !== director.nombre)
                                                            .map((usuario) => (
                                                                <option
                                                                    key={usuario.id}
                                                                    value={usuario.id}
                                                                    selected={usuario.nombre === jurado.nombre}
                                                                >
                                                                    {usuario.nombre}
                                                                </option>
                                                            ))}
                                                    </Select>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                        </>
                    )}

                    {proyecto.acronimo !== "AUX" && (
                        <> <Box>

                            <Typography variant="h6" color={colors.secundary[100]} sx={{ mt: "30px", mb: "10px" }}>
                                Lector(s)
                            </Typography>

                            <Grid container spacing={2}>
                                {[...Array(1)].map((_, index) => {
                                    const listaLector = lector[index] || {};

                                    return (
                                        <Grid item key={index} xs={12}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
                                                    <Typography variant="h6" color={colors.primary[100]}>
                                                        Nombre Completo
                                                    </Typography>
                                                    <Select
                                                        fullWidth
                                                        native
                                                        onChange={handleLectorChange}
                                                        inputProps={{
                                                            name: "lector",
                                                            id: "lector",
                                                        }}
                                                    >
                                                        <option value="" />
                                                        {listaUsuarios
                                                            .filter((usuario) => usuario.nombre !== director.nombre)
                                                            .map((usuario) => (
                                                                <option
                                                                    key={usuario.id}
                                                                    value={usuario.nombre}
                                                                    selected={usuario.nombre === lector}
                                                                >
                                                                    {usuario.nombre}
                                                                </option>
                                                            ))}
                                                    </Select>

                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                        </>
                    )}
                </Box>
            ) : (
                <Typography variant="h6" color={colors.primary[100]}>{mensaje.texto}</Typography>
            )}

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
                marginBottom: '20px',
                borderRadius: 0,
                textTransform: 'none',
                marginTop: '20px',
                fontSize: '14px',
            }} onClick={handleSubmit}>
                Guardar
            </Button>
        </div>
    );
}