import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Select, MenuItem, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CrearEspacio(props) {
    const token = useSelector(selectToken);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaAperturaEntrega, setFechaAperturaEntrega] = useState(dayjs());
    const [fechaCierreEntrega, setFechaCierreEntrega] = useState(dayjs());
    const [fechaAperturaCalificacion, setFechaAperturaCalificacion] = useState(dayjs());
    const [fechaCierreCalificacion, setFechaCierreCalificacion] = useState(dayjs());
    const [idRol, setIdRol] = useState("");
    const [idModalidad, setIdModalidad] = useState("");
    const [idEtapa, setIdEtapa] = useState("");
    const [idRubrica, setIdRubrica] = useState("");

    const [roles, setRoles] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [etapas, setEtapas] = useState([]);
    const [rubricas, setRubricas] = useState([]);

    const obtenerRoles = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/roles", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setRoles(data.roles);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerModalidades = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/modalidades", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setModalidades(data.modalidades);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerEtapas = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/etapas", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setEtapas(data.etapas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerRubricas = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/rubricas", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setRubricas(data.rubricas);

            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleNombreChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    const handleDescripcionChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setDescripcion(isOnlyWhitespace ? "" : value);
    };

    const handleIdRolChange = (event) => {
        setIdRol(event.target.value);
    };

    const handleIdModalidadChange = (event) => {
        setIdModalidad(event.target.value);
    };

    const handleIdEtapaChange = (event) => {
        setIdEtapa(event.target.value);
    };

    const handleIdRubricaChange = (event) => {
        setIdRubrica(event.target.value);
    };

    const guardarEspacio = async (event) => {
        event.preventDefault();
        const today = dayjs();
        const fechaAperturaEntregaDate = dayjs(fechaAperturaEntrega);
        const fechaCierreEntregaDate = dayjs(fechaCierreEntrega);
        const fechaAperturaCalificacionDate = dayjs(fechaAperturaCalificacion);
        const fechaCierreCalificacionDate = dayjs(fechaCierreCalificacion);

        if (fechaAperturaEntregaDate.isBefore(today, 'minute')) {
            mostrarMensaje("La fecha de apertura debe ser mayor o igual a la fecha actual.", "error");
            return;
        }

        if (fechaCierreEntregaDate.isBefore(fechaAperturaEntregaDate, 'minute')) {
            mostrarMensaje("La fecha de cierre debe ser mayor a la fecha de apertura.", "error");
            return;
        }

        if (fechaAperturaCalificacionDate.isBefore(fechaCierreEntregaDate, 'minute')) {
            mostrarMensaje("La fecha de inicio de calificación debe ser posterior a la fecha de cierre de entregas.", "error");
            return;
        }

        if (fechaCierreCalificacionDate.isBefore(fechaAperturaCalificacionDate, 'minute')) {
            mostrarMensaje("La fecha de cierre para calificar debe ser mayor a la fecha de inicio de calificación.", "error");
            return;
        }
        const espacioData = {
            nombre,
            descripcion,
            fecha_apertura_entrega: fechaAperturaEntrega.format("DD/MM/YYYY hh:mm A"),
            fecha_cierre_entrega: fechaCierreEntrega.format("DD/MM/YYYY hh:mm A"),
            fecha_apertura_calificacion: fechaAperturaCalificacion.format("DD/MM/YYYY hh:mm A"),
            fecha_cierre_calificacion: fechaCierreCalificacion.format("DD/MM/YYYY hh:mm A"),
            id_rol: idRol,
            id_modalidad: idModalidad,
            id_etapa: idEtapa,
            id_rubrica: idRubrica,
        };
        try {
            const response = await fetch("http://localhost:5000/comite/espacio", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(espacioData)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                onSubmit();
                setNombre("");
                setDescripcion("");
                setFechaAperturaEntrega(dayjs());
                setFechaCierreEntrega(dayjs());
                setFechaAperturaCalificacion(dayjs());
                setFechaCierreCalificacion(dayjs());
                setIdRol("");
                setIdModalidad("");
                setIdEtapa("");
                setIdRubrica("");

            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const handleEntering = async () => {
        obtenerRoles();
        obtenerModalidades();
        obtenerRubricas()
        obtenerEtapas();
    }

    const handleCancel = () => {
        onClose();
        setNombre("");
        setDescripcion("");
        setFechaAperturaEntrega(dayjs());
        setFechaCierreEntrega(dayjs());
        setFechaAperturaCalificacion(dayjs());
        setFechaCierreCalificacion(dayjs());
        setIdRol("");
        setIdModalidad("");
        setIdEtapa("");
        setIdRubrica("");
    };

    return (

        <Dialog maxWidth="md" fullWidth TransitionComponent={Transition} open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <form onSubmit={guardarEspacio}>
                <DialogTitle variant="h1" color="primary">
                    CREAR ESPACIO
                </DialogTitle>

                <DialogContent dividers >
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Nombre
                            </Typography>
                            <TextField
                                value={nombre}
                                onChange={handleNombreChange}
                                required
                                fullWidth
                                error={!nombre}
                                helperText={'Ingresa el nombre del espacio'} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Descripción
                            </Typography>
                            <TextField
                                value={descripcion}
                                onChange={handleDescripcionChange}
                                multiline
                                rows={1}
                                required
                                fullWidth
                                error={!descripcion}
                                helperText={'Ingresa la descripción del espacio'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de apertura entregas
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={fechaAperturaEntrega}
                                    onChange={(newValue) => setFechaAperturaEntrega(newValue)}
                                    required
                                    format="DD/MM/YYYY hh:mm A"
                                    fullWidth
                                    sx={{ minWidth: '100%' }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de cierre entregas
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={fechaCierreEntrega}
                                    onChange={(newValue) => setFechaCierreEntrega(newValue)}
                                    required
                                    format="DD/MM/YYYY hh:mm A"
                                    fullWidth
                                    sx={{ minWidth: '100%' }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de apertura calificación
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={fechaAperturaCalificacion}
                                    onChange={(newValue) => setFechaAperturaCalificacion(newValue)}
                                    required
                                    format="DD/MM/YYYY hh:mm A"
                                    fullWidth
                                    sx={{ minWidth: '100%' }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de cierre calificación
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={fechaCierreCalificacion}
                                    onChange={(newValue) => setFechaCierreCalificacion(newValue)}
                                    required
                                    format="DD/MM/YYYY hh:mm A"
                                    fullWidth
                                    sx={{ minWidth: '100%' }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Rol Calificador
                            </Typography>
                            <Select
                                value={idRol}
                                onChange={handleIdRolChange}
                                required
                                fullWidth
                            >
                                {roles.map((rol) => (
                                    <MenuItem key={rol.id} value={rol.id}>
                                        {rol.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Modalidad
                            </Typography>
                            <Select
                                value={idModalidad}
                                onChange={handleIdModalidadChange}
                                required
                                fullWidth
                            >   {modalidades.map((modalidad) => (
                                <MenuItem key={modalidad.id} value={modalidad.id}>
                                    {modalidad.nombre}
                                </MenuItem>
                            ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Etapa
                            </Typography>
                            <Select
                                value={idEtapa}
                                onChange={handleIdEtapaChange}
                                required
                                fullWidth
                            >
                                {etapas.map((etapa) => (
                                    <MenuItem key={etapa.id} value={etapa.id}>
                                        {etapa.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Rubrica
                            </Typography>
                            <Select
                                value={idRubrica}
                                onChange={handleIdRubricaChange}
                                required
                                fullWidth
                            >
                                {rubricas.map((rubrica) => (
                                    <MenuItem key={rubrica.id} value={rubrica.id}>
                                        {rubrica.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    );
}
CrearEspacio.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CrearEspacio;