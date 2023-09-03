import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid, Select, MenuItem } from "@mui/material";
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

function EditarReunion(props) {

    const id = sessionStorage.getItem('user_id_usuario');
    const idRol = sessionStorage.getItem('id_rol');
    const idReunion = sessionStorage.getItem('usuario_id_reunion');
    const token = useSelector(selectToken);

    const reunionCadena = sessionStorage.getItem('usuario_reunion_editar');
    const reunion = JSON.parse(reunionCadena);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");
    const [fecha, setFecha] = useState('');
    const [selectedTime, setSelectedTime] = useState(true);
    const [idEstado, setIdEstado] = useState("");
    const [idProyecto, setIdProyecto] = useState("");

    const [asistencia, setAsistencia] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const obtenerAsistencia = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/usuario/obtenerAsistencia`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();

            if (!data.success) {
                mostrarMensaje(data.message, 'error');
            } else {
                setAsistencia(data.asistencia);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }, [token, mostrarMensaje]);

    useEffect(() => {
        obtenerAsistencia();
    }, [obtenerAsistencia]);

    const handleEntering = async () => {
        setNombre(reunion.nombre);
        setLink(reunion.enlace);
        const fechaHoraArray = reunion.fecha.split(' ');
        const fechaReunion = fechaHoraArray[0];
        const horaReunion = fechaHoraArray[1];
        setFecha(dayjs(fechaReunion, 'DD-MM-YYYY'));
        setSelectedTime(dayjs(horaReunion, 'HH:mm'));
        setIdEstado(parseInt(reunion.id_estado));
        setIdProyecto(parseInt(reunion.id_proyecto));
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

    const handleTimeChange = (newTime) => {
        setSelectedTime(newTime);
    };

    const shouldDisableDate = (date) => {
        const currentDate = dayjs();
        return date.isBefore(currentDate, 'day');
    };

    const [idAsistenciaSeleccionada, setIdAsistenciaSeleccionada] = useState("");
    const handleAsistenciaSeleccionada = (event) => {
        if (event.target.value !== "") {
            setIdAsistenciaSeleccionada(event.target.value);
        } else {
            setIdAsistenciaSeleccionada("")
        }
    };

    const handleCancel = () => {
        onClose();
        setLink("");
        setNombre("");
        setSelectedTime(null);
        setFecha("");
        sessionStorage.removeItem('usuario_reunion_editar');
        setIdAsistenciaSeleccionada("");
        setIdEstado("");
    };

    const guardarSolicitud = async (event) => {
        event.preventDefault();

        if (idEstado === 1) {

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

                    if (nombre === reunion.nombre && link === reunion.enlace && fechaHoraFormateada === reunion.fecha) {
                        mostrarMensaje("No se ha modificado ninguna información de la reunión.", "error");
                    } else {
                        try {
                            const response = await fetch("http://localhost:5000/usuario/editarReunion", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({
                                    id: idReunion,
                                    nombre: nombre,
                                    fecha: fechaHoraFormateada,
                                    enlace: link,
                                    idUsuario: id,
                                    idRol: idRol
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

        } else {
            if (idEstado !== 1 && idAsistenciaSeleccionada === "") {
                mostrarMensaje("Por favor seleccione un estado de asistencia para la reunión.", "error")
            } else {
                try {
                    const response = await fetch("http://localhost:5000/usuario/editarReunion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            id: idReunion,
                            idAsistencia: idAsistenciaSeleccionada,
                            idUsuario: id,
                            idProyecto: idProyecto,
                            idRol: idRol
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
    };

    return (
        <Dialog maxWidth="sm" fullWidth TransitionComponent={Transition} open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <form onSubmit={guardarSolicitud}>
                <DialogTitle variant="h1" color="primary">
                    EDITAR REUNIÓN
                </DialogTitle>

                <DialogContent dividers >
                    <Grid container spacing={2}>
                        {idEstado === 1 && (
                            <>
                                <Grid item xs={6} >
                                    <Typography variant="h6" color="primary">
                                        Fecha
                                    </Typography>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            required
                                            value={fecha}
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
                                            value={selectedTime}
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
                            </>
                        )}

                        {idEstado !== 1 && (
                            <Grid item xs={12}>
                                <Typography variant="h6" color="primary">
                                    Asistencia
                                </Typography>
                                <Select
                                    fullWidth
                                    onChange={handleAsistenciaSeleccionada}
                                    value={idAsistenciaSeleccionada}
                                >
                                    {asistencia.map((listaAsistencia) => (
                                        <MenuItem key={listaAsistencia.id} value={listaAsistencia.id}>
                                            {listaAsistencia.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                        )}
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
EditarReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default EditarReunion;