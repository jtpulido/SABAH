import React, { useState, useEffect, useCallback } from "react";

import { Typography, Box, TextField, Grid, CssBaseline, Tooltip, IconButton } from "@mui/material";

import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { useSnackbar } from 'notistack';
import CustomDataGrid from "../../layouts/DataGrid";
import { Feed, Source } from "@mui/icons-material";
import VerSolicitud from "../../proyecto/VentanasSolicitud/VerSolicitud";
import VerEntrega from "../../proyecto/VentanasEntregas/VerEntrega";

export default function VerProyectos() {

    const id = sessionStorage.getItem('id_proyecto');
    const token = useSelector(selectToken);
    const [existe, setExiste] = useState([]);
    const [proyecto, setProyecto] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [existeLector, setExisteLector] = useState([]);
    const [existeJurados, setExisteJurados] = useState([]);
    const [listaJurado, setListaJurado] = useState([]);
    const [entrega, setEntrega] = useState({});
    const [tipo, setTipo] = useState("");
    const [rowsPendientes, setRowsPendientes] = useState([]);
    const [rowsCalificadas, setRowsCalificadas] = useState([]);
    const [rowsPorCalificar, setRowsPorCalificar] = useState([]);
    const [rowsSolEnCurso, setRowsSolEnCurso] = useState([]);
    const [rowsSolAprobadas, setRowsSolAprobadas] = useState([]);
    const [rowsSolRechazadas, setRowsSolRechazadas] = useState([]);
    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);
    const [idSolicitud, setIdSolicitud] = useState(null);
    const [open, setOpen] = useState(false);

    const abrirDialog = (id) => {
        setIdSolicitud(id)
        setOpen(true);
    };

    const cerrarDialog = () => {
        setOpen(false);
    }
    const [openCalificar, setOpenCalificar] = useState(false);
    const abrirDialogCalificar = (row, tipo) => {
        setEntrega(row)
        setTipo(tipo)
        setOpenCalificar(true);
    };
    const cerrarDialogCalificar = () => {
        setEntrega({})
        setOpenCalificar(false);
    }
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


    const llenarTabla = async (endpoint, proyecto_id, setRowsFunc) => {
        try {
            const response = await fetch(`http://localhost:5000/proyecto/${endpoint}/${proyecto_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setRowsFunc(data.espacios);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    }
    const llenarTablaSolicitudes = async (endpoint, setRowsFunc, id) => {
        try {
            const response = await fetch(`http://localhost:5000/proyecto/${endpoint}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setRowsFunc(data.solicitudes);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
   
    useEffect(() => {
        infoProyecto()
        llenarTabla("obtenerEntregasPendientes", id, setRowsPendientes);
        llenarTabla("obtenerEntregasCalificadas", id, setRowsCalificadas);
        llenarTabla("obtenerEntregasSinCalificar", id, setRowsPorCalificar);
        llenarTablaSolicitudes("obtenerSolicitudesPendientes", setRowsSolEnCurso, id);
        llenarTablaSolicitudes("obtenerSolicitudesRechazadas", setRowsSolRechazadas, id);
        llenarTablaSolicitudes("obtenerSolicitudesAprobadas", setRowsSolAprobadas, id);
    }, [id]);

    const generarColumnas = (inicio, extraColumns) => {
        const columns = [
            { field: 'nombre_proyecto', headerName: 'Nombre del proyecto', flex: 0.2, minWidth: 300 },
            { field: 'nombre_espacio_entrega', headerName: 'Nombre de la entrega', flex: 0.3, minWidth: 200 },
            { field: 'nombre_rol', headerName: 'Evaluador', flex: 0.1, minWidth: 100 }
        ]
        return [...inicio, ...columns, ...extraColumns];
    };

    const columnaPendientes = generarColumnas([{
        field: "ver",
        headerName: "",
        flex: 0.1,
        minWidth: 50,
        renderCell: ({ row }) => {
            return (
                <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
                    <Tooltip title="Ver Entrega">
                        <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "pendiente")}>
                            <Source />
                        </IconButton>
                    </Tooltip>
                </Box>
            );
        },
    }], [
        { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
        { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },

    ]);
    const columnaPorCalificar = generarColumnas([
        {
            field: "calificar",
            headerName: "",
            flex: 0.1,
            minWidth: 50,
            renderCell: ({ row }) => {
                return (
                    <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
                        <Tooltip title="Calificar">
                            <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "")}>
                                <Source />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        }], [
        { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
        { field: 'fecha_apertura', headerName: 'Fecha de apertura', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
        { field: 'fecha_cierre', headerName: 'Fecha de cierre', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
        { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 100, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },

    ]);
    const columnaCalificadas = generarColumnas([{
        field: "calificado",
        headerName: "",
        flex: 0.1,
        minWidth: 50,
        renderCell: ({ row }) => {
            return (
                <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
                    <Tooltip title="Calificar">
                        <IconButton color="secondary" onClick={() => abrirDialogCalificar(row, "calificado")}>
                            <Source />
                        </IconButton>
                    </Tooltip>
                </Box>
            );
        },
    }], [
        { field: 'evaluador', headerName: 'Nombre de evaluador', flex: 0.2, minWidth: 150 },
        { field: 'fecha_entrega', headerName: 'Fecha de entrega', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
        { field: 'fecha_evaluacion', headerName: 'Fecha de evaluación', flex: 0.1, minWidth: 150, valueFormatter: ({ value }) => new Date(value).toLocaleString('es-ES') },
        { field: 'nota_final', headerName: 'Nota', flex: 0.1, minWidth: 100 },

    ]);
    const generarColumnasSol = (extraColumns) => {
        const commonColumns = [
            {
                field: "Acción", headerName: "", flex: 0.01, minWidth: 50,
                renderCell: ({ row }) => {
                    const { id } = row;
                    return (
                        <Box width="100%" m="0 auto" p="5px" display="flex" justifyContent="center">
                            <Box mr="5px">
                                <Tooltip title="Ver Solicitud" >
                                    <IconButton color="secondary" onClick={() => abrirDialog(id)}>
                                        <Feed />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    );
                },
            },
            { field: 'creado_por', headerName: 'Creado por', flex: 0.1, valueFormatter: ({ value }) => (value ? 'Proyecto' : 'Director') },
            { field: 'tipo_solicitud', headerName: 'Tipo de solicitud', flex: 0.2, minWidth: 150 },
            { field: 'fecha_solicitud', headerName: 'Fecha de solicitud', flex: 0.1, valueFormatter: ({ value }) => new Date(value).toLocaleDateString('es-ES') },
        ];

        return [...commonColumns, ...extraColumns];
    };
   
    const columnsSolPendientes = generarColumnasSol([{
        field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.1
    }]);
    const columnsSolAprobadas = generarColumnasSol([
        { field: 'fecha_aprobado_director', headerName: 'Aprobado Director', flex: 0.1 },
        { field: 'fecha_aprobado_comite', headerName: 'Aprobado Comité', flex: 0.1 }
    ]);
    const columnsSolRechazadas = generarColumnasSol([
        { field: 'fecha_director', headerName: 'Respuesta Director', flex: 0.1 },
        { field: 'fecha_aprobado_comite', headerName: 'Rechazada Comité', flex: 0.1 }
    ]);

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
            <Box mt={4}>
                <Typography variant="h4" color="secondary" sx={{ mt: "30px" }}>
                    ENTREGAS
                </Typography>
                <VerEntrega
                    open={openCalificar}
                    onClose={cerrarDialogCalificar}
                    entrega={entrega}
                    tipo={tipo}
                />
                <Typography variant="h5" color="primary" sx={{ mt: "30px" }}>
                    Entregas pendientes
                </Typography>
                <CustomDataGrid rows={rowsPendientes} columns={columnaPendientes} mensaje="No hay entregas pendientes" />

                <Typography variant="h5" color="primary" sx={{ mt: "30px" }}>
                    Entregas sin calificar
                </Typography>
                <CustomDataGrid rows={rowsPorCalificar} columns={columnaPorCalificar} mensaje="No hay entregas sin calificar" />

                <Typography variant="h5" color="primary" sx={{ mt: "30px" }}>
                    Entregas calificadas
                </Typography>
                <CustomDataGrid rows={rowsCalificadas} columns={columnaCalificadas} mensaje="No hay entregas calificadas" />

            </Box>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" color="secondary" sx={{ mt: "30px" }}>
                    SOLICITUDES
                </Typography>
                <VerSolicitud
                    open={open}
                    onClose={cerrarDialog}
                    id_solicitud={idSolicitud}
                />
                <Typography variant="h5" color="primary"
                    sx={{ mt: "30px" }}>
                    Pendientes por aprobar
                </Typography>
                <CustomDataGrid rows={rowsSolEnCurso} columns={columnsSolPendientes} mensaje="No hay solicitudes pendientes." />

                <Typography variant="h5" color="primary"
                    sx={{ mt: "30px" }}>
                    Aprobadas
                </Typography>
                <CustomDataGrid rows={rowsSolAprobadas} columns={columnsSolAprobadas} mensaje="No hay solicitudes aprobadas." />

                <Typography variant="h5" color="primary"
                    sx={{ mt: "30px" }}>
                    Rechazadas
                </Typography>
                <CustomDataGrid rows={rowsSolRechazadas} columns={columnsSolRechazadas} mensaje="No hay solicitudes rechazadas." />

            </Box>

        </div>
    );
}