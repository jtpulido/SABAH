import React, { useState, useCallback } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid, Select } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CrearReunion(props) {

    const id = sessionStorage.getItem('user_id_usuario');
    const idRol = sessionStorage.getItem('id_rol');

    const token = useSelector(selectToken);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");

    const [proyectos, setProyecto] = useState([]);
    const [ultIdReunion, setUltIdReunion] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const obtenerUltIdReunion = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/usuario/ultIdReunion", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setUltIdReunion(data.id);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    }, [token, mostrarMensaje]);

    const obtenerProyectos = useCallback(async () => {
        const idUsuario = id;
        try {
            const response = await fetch(`http://localhost:5000/usuario/obtenerProyectosDesarrolloRol/${idUsuario}/${idRol}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (data.message === 'No hay proyectos actualmente') {
                setProyecto([]);
            } else {
                setProyecto(data.proyectos);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token, id, idRol]);

    const handleEntering = async () => {
        obtenerUltIdReunion();
        obtenerProyectos();
    };

    const handleNombreChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    const handleLinkChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setLink(isOnlyWhitespace ? "" : value);
    };

    const handleCancel = () => {
        onClose();
        setLink("");
        setNombre("");
        setSelectedTime(null);
        setFecha('');
        setIdProyectoSeleccionado("");
    };

    const [fecha, setFecha] = useState('');

    const [selectedTime, setSelectedTime] = useState(true);
    const handleTimeChange = (newTime) => {
        setSelectedTime(newTime);
    };

    const shouldDisableDate = (date) => {
        const currentDate = dayjs();
        return date.isBefore(currentDate, 'day');
    };

    const [idProyectoSeleccionado, setIdProyectoSeleccionado] = useState("");
    const handleProyectoSeleccionado = (event) => {
        if (event.target.value !== "") {
            setIdProyectoSeleccionado(event.target.value);
        } else {
            setIdProyectoSeleccionado("");
        }
    };

    const guardarSolicitud = async (event) => {
        event.preventDefault();

        if (fecha === '' || fecha === undefined || selectedTime === null) {
            mostrarMensaje("Por favor seleccione un valor de fecha y hora válidos.", "error");

        } else {
            const fechaFormateada = fecha ? fecha.format('DD-MM-YYYY') : '';
            const horaFormateada = selectedTime ? selectedTime.format('HH:mm') : '';
            const fechaHoraFormateada = `${fechaFormateada} ${horaFormateada}`;

            const currentDate = dayjs();
            const selectedDateTime = dayjs(fechaHoraFormateada, 'DD-MM-YYYY HH:mm');
            const isValidDateTime = selectedDateTime.isAfter(currentDate);

            if (!isValidDateTime) {
                mostrarMensaje("La fecha y hora seleccionadas deben ser después de la fecha y hora actual.", "error");
            } else {

                if (idProyectoSeleccionado === "") {
                    mostrarMensaje("Por favor, selecciona un proyecto antes de agendar la reunión.", "error")

                } else {
                    try {
                        const response = await fetch("http://localhost:5000/usuario/crearReunionInvitados", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                id_reunion: parseInt(ultIdReunion) + 1,
                                id_usuario: parseInt(id),
                                id_rol: parseInt(idRol),
                                nombre: nombre,
                                fecha: fechaHoraFormateada,
                                enlace: link,
                                id_proyecto: parseInt(idProyectoSeleccionado),
                                id_estado: 1,
                            })
                        });
                        const data = await response.json();
                        if (!data.success) {
                            mostrarMensaje(data.message, "error");
                        } else {
                            mostrarMensaje(data.message, "success");
                            handleCancel();
                        }
                    } catch (error) {
                        mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
                    }
                }
            }
        }
    };

    return (
        <Dialog maxWidth="sm" fullWidth TransitionComponent={Transition} open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <form onSubmit={guardarSolicitud}>
                <DialogTitle variant="h1" color="primary">
                    CREAR REUNIÓN
                </DialogTitle>

                <DialogContent dividers >
                    <Grid container spacing={2}>
                        <Grid item xs={6} >
                            <Typography variant="h6" color="primary">
                                Fecha
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    required
                                    onChange={(newValue) => setFecha(newValue)}
                                    format="DD-MM-YYYY"
                                    error={!fecha}
                                    shouldDisableDate={shouldDisableDate}
                                    fullWidth
                                    sx={{ minWidth: '100%' }}
                                    components={{
                                        openPickerIcon: () => (
                                            <CalendarMonthIcon sx={{ color: '#576a3d', marginRight: '20px' }} />
                                        ),
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={6} >
                            <Typography variant="h6" color="primary">
                                Hora
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    required
                                    error={!selectedTime}
                                    onChange={handleTimeChange}
                                    renderInput={(params) => <input {...params} />}
                                    ampm={false}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock,
                                    }}
                                    sx={{ minWidth: '100%' }}
                                    components={{
                                        openPickerIcon: () => (
                                            <AccessTimeIcon sx={{ color: '#576a3d', marginRight: '20px' }} />
                                        ),
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>


                        <Grid item xs={6} >
                            <Typography variant="h6" color="primary">
                                Nombre
                            </Typography>
                            <TextField
                                value={nombre}
                                onChange={handleNombreChange}
                                multiline
                                rows={1}
                                required
                                fullWidth
                                error={!nombre}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <Typography variant="h6" color="primary">
                                Link
                            </Typography>
                            <TextField
                                value={link}
                                onChange={handleLinkChange}
                                multiline
                                rows={1}
                                required
                                fullWidth
                                error={!link}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Proyecto
                            </Typography>
                            <Select
                                fullWidth
                                native
                                onChange={handleProyectoSeleccionado}
                                inputProps={{
                                    name: "proyecto",
                                    id: "proyecto",
                                }}
                            >
                                <option value="" />
                                {proyectos.map((listaProyectos) => (
                                    <option key={listaProyectos.id} value={listaProyectos.id}>
                                        {listaProyectos.nombre.length > 80
                                            ? `${listaProyectos.nombre.slice(0, 80)}...`
                                            : listaProyectos.nombre}
                                    </option>
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
CrearReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CrearReunion;