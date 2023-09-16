import React, { useEffect, useState } from 'react';

import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Select, MenuItem, Dialog, Typography, DialogContent, DialogTitle, DialogActions, Grid, CircularProgress, Box, IconButton, useTheme, FormControlLabel, Checkbox } from "@mui/material";
import { Edit, SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { tokens } from '../../../../theme';

function VerModificarEspacio(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);

    const { onClose, onSubmit, espacio, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaAperturaEntrega, setFechaAperturaEntrega] = useState(dayjs());
    const [fechaCierreEntrega, setFechaCierreEntrega] = useState(dayjs());
    const [fechaAperturaCalificacion, setFechaAperturaCalificacion] = useState(dayjs());
    const [fechaCierreCalificacion, setFechaCierreCalificacion] = useState(dayjs());
    const [entregaFinal, setEntregaFinal] = useState("");
    const [idRol, setIdRol] = useState("");
    const [idModalidad, setIdModalidad] = useState("");
    const [idEtapa, setIdEtapa] = useState("");
    const [idRubrica, setIdRubrica] = useState("");
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [etapas, setEtapas] = useState([]);
    const [rubricas, setRubricas] = useState([]);
    const [editMode, setEditMode] = useState(false);

    const handleEntering = async () => {
        setNombre(espacio.nombre)
        setDescripcion(espacio.descripcion)
        setFechaCierreEntrega(espacio.fecha_cierre_entrega)
        setFechaAperturaEntrega(espacio.fecha_apertura_entrega)
        setFechaCierreCalificacion(espacio.fecha_cierre_calificacion)
        setFechaAperturaCalificacion(espacio.fecha_apertura_calificacion)
        setEntregaFinal(espacio.final)
        obtenerRoles();
        obtenerModalidades();
        obtenerEtapas();
        obtenerRubricas()
        setLoading(false);
    }
    useEffect(() => {
        if (roles.length > 0 && modalidades.length > 0 && etapas.length > 0 && rubricas.length > 0) {
            setIdRol(espacio.id_rol);
            setIdModalidad(espacio.id_modalidad);
            setIdEtapa(espacio.id_etapa);
            setIdRubrica(espacio.id_rubrica);
            setLoading(false);
        }
    }, [roles, modalidades, etapas, rubricas, espacio.id_rol, espacio.id_modalidad, espacio.id_etapa, espacio.id_rubrica]);

    const obtenerRoles = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/roles`, {
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
            const response = await fetch(`${apiBaseUrl}/comite/modalidades`, {
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
            const response = await fetch(`${apiBaseUrl}/comite/etapas`, {
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
            const response = await fetch(`${apiBaseUrl}/comite/rubricas`, {
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
    const habilitarEdicion = () => {
        setEditMode(!editMode);
    };
    const handleEntregaFinalChange = (event) => {
        setEntregaFinal(event.target.checked);
    };
    const modificarEspacio = async (event) => {
        event.preventDefault();
        const fechaAperturaEntregaDate = dayjs(fechaAperturaEntrega);
        const fechaCierreEntregaDate = dayjs(fechaCierreEntrega);
        const fechaAperturaCalificacionDate = dayjs(fechaAperturaCalificacion);
        const fechaCierreCalificacionDate = dayjs(fechaCierreCalificacion);

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
            fecha_apertura_entrega: fechaAperturaEntregaDate.format("DD/MM/YYYY hh:mm A"),
            fecha_cierre_entrega: fechaCierreEntregaDate.format("DD/MM/YYYY hh:mm A"),
            fecha_apertura_calificacion: fechaAperturaCalificacionDate.format("DD/MM/YYYY hh:mm A"),
            fecha_cierre_calificacion: fechaCierreCalificacionDate.format("DD/MM/YYYY hh:mm A"),
            id_rol: idRol,
            id_modalidad: idModalidad,
            id_etapa: idEtapa,
            id_rubrica: idRubrica,
            final: entregaFinal
        };
        try {
            const response = await fetch(`${apiBaseUrl}/comite/espacio/${espacio.id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(espacioData)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                onSubmit();
                setNombre("");
                setDescripcion("");
                setFechaAperturaEntrega(dayjs());
                setFechaCierreEntrega(dayjs());
                setIdRol("");
                setIdModalidad("");
                setIdEtapa("");
                setIdRubrica("");
                setEditMode(false);
                mostrarMensaje(data.message, "success");
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };


    const handleCancel = () => {
        onClose();
        setNombre("");
        setDescripcion("");
        setFechaAperturaEntrega(dayjs());
        setFechaCierreEntrega(dayjs());
        setIdRol("");
        setIdModalidad("");
        setIdEtapa("");
        setIdRubrica("");
        setLoading(true);
        setEditMode(false)
    };

    return (

        <Dialog maxWidth="md" fullWidth open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <form onSubmit={modificarEspacio}>
                <DialogTitle variant="h1" color="primary">
                    VER/MODIFICAR ESPACIO
                    <IconButton onClick={habilitarEdicion}>
                        <Edit />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers >
                    <Typography variant="h6" color={colors.naranja[100]}>
                        Si un proyecto ya realizo la entrega nos se puede cambiar la etapa y la modalidad. No se puede modificar el evaluador y la rubrica en un espacio si ya se ha calificado una entrega realizada en el mismo.
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
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
                                        disabled={!editMode}
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
                                        rows={2}
                                        required
                                        disabled={!editMode}
                                        fullWidth
                                        error={!descripcion}
                                        helperText={'Ingresa la descripción del espacio'}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" color="primary">
                                        Fecha de apertura entrega
                                    </Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateTimePicker
                                            value={dayjs(fechaAperturaEntrega)}
                                            onChange={(newValue) => setFechaAperturaEntrega(newValue)}
                                            required
                                            disabled={!editMode}
                                            format="DD/MM/YYYY hh:mm A"
                                            fullWidth
                                            sx={{ minWidth: '100%' }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" color="primary">
                                        Fecha de cierre entrega
                                    </Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateTimePicker
                                            value={dayjs(fechaCierreEntrega)}
                                            onChange={(newValue) => setFechaCierreEntrega(newValue)}
                                            required
                                            disabled={!editMode}
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
                                            value={dayjs(fechaAperturaCalificacion)}
                                            onChange={(newValue) => setFechaAperturaCalificacion(newValue)}
                                            required
                                            disabled={!editMode}
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
                                            value={dayjs(fechaCierreCalificacion)}
                                            onChange={(newValue) => setFechaCierreCalificacion(newValue)}
                                            required
                                            disabled={!editMode}
                                            format="DD/MM/YYYY hh:mm A"
                                            fullWidth
                                            sx={{ minWidth: '100%' }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} sm={5}>
                                    <Typography variant="h6" color="primary">
                                        Etapa
                                    </Typography>
                                    <Select
                                        value={idEtapa}
                                        onChange={handleIdEtapaChange}
                                        required
                                        disabled={!editMode}
                                        fullWidth
                                    >
                                        {etapas.map((etapa) => (
                                            <MenuItem key={etapa.id} value={etapa.id}>
                                                {etapa.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <Typography variant="h6" color="primary">
                                        Modalidad
                                    </Typography>
                                    <Select
                                        value={idModalidad}
                                        onChange={handleIdModalidadChange}
                                        required
                                        disabled={!editMode}
                                        fullWidth
                                    >   {modalidades.map((modalidad) => (
                                        <MenuItem key={modalidad.id} value={modalidad.id}>
                                            {modalidad.nombre}
                                        </MenuItem>
                                    ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={12} sm={2} md={2} >
                                    <Typography variant="h6" color="primary">
                                        Entrega Final
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, }}                            >
                                        <FormControlLabel
                                            control={<Checkbox checked={entregaFinal} disabled={!editMode} onChange={handleEntregaFinalChange} />}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" color="primary">
                                        Rol Calificador
                                    </Typography>
                                    <Select
                                        value={idRol}
                                        onChange={handleIdRolChange}
                                        required
                                        disabled={!editMode}
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
                                        Rubrica
                                    </Typography>
                                    <Select
                                        value={idRubrica}
                                        onChange={handleIdRubricaChange}
                                        required
                                        disabled={!editMode}
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
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }} disabled={!editMode}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    );
}
VerModificarEspacio.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    espacio: PropTypes.object.isRequired
};

export default VerModificarEspacio;