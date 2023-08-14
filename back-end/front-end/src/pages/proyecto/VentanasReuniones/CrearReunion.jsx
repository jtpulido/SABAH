import React, { useState, useCallback } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid, Checkbox } from "@mui/material";
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

    const id = sessionStorage.getItem('id_proyecto');
    const token = useSelector(selectToken);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");

    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [jurado, setJurado] = useState([]);
    const [cliente, setCliente] = useState([]);

    const [ultIdReunion, setUltIdReunion] = useState([]);

    const obtenerInfoDirector = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/proyecto/obtenerInfoDirector", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setDirector(data.director);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    }, [token, id]);

    const obtenerInfoLector = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/proyecto/obtenerInfoLector", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setLector(data.lector);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    }, [token, id]);

    const obtenerInfoJurado = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/proyecto/obtenerInfoJurado", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setJurado(data.jurado);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    }, [token, id]);

    const obtenerInfoCliente = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/proyecto/obtenerInfoCliente", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                setCliente(data.cliente);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    }, [token, id]);

    const obtenerUltIdReunion = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/proyecto/ultIdReunion", {
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
    }, [token, id]);

    const handleEntering = async () => {
        obtenerInfoDirector();
        obtenerInfoLector();
        obtenerInfoJurado();
        obtenerInfoCliente();
        obtenerUltIdReunion();
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
        setDirectorChecked(false);
        setLectorChecked(false);
        setJuradoChecked([]);
        setClienteChecked(false);
        setFecha('');
        setCheckedStates(resetCheckedStates);
    };

    const [directorChecked, setDirectorChecked] = useState(false);
    const handleDirectorChange = (event) => {
        setCheckedStates((prevState) => ({
            ...prevState,
            directorChecked: event.target.checked,
        }));
        setDirectorChecked(event.target.checked);
    };

    const [lectorChecked, setLectorChecked] = useState(false);
    const handleLectorChange = (event) => {
        setCheckedStates((prevState) => ({
            ...prevState,
            lectorChecked: event.target.checked,
        }));
        setLectorChecked(event.target.checked);
    };

    const [juradoChecked, setJuradoChecked] = useState([]);
    const handleJuradoMemberChange = (index) => (event) => {
        setCheckedStates((prevState) => {
            const newJuradoStates = [...prevState.juradoChecked];
            newJuradoStates[index] = event.target.checked;
            return {
                ...prevState,
                juradoChecked: newJuradoStates,
            };
        });
        const newJuradoStates = [...juradoChecked];
        newJuradoStates[index] = event.target.checked;
        setJuradoChecked(newJuradoStates);
    };

    const [clienteChecked, setClienteChecked] = useState(false);
    const handleClienteChange = (event) => {
        setCheckedStates((prevState) => ({
            ...prevState,
            clienteChecked: event.target.checked,
        }));
        setClienteChecked(event.target.checked);
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

    const [checkedStates, setCheckedStates] = useState({
        clienteChecked: false,
        directorChecked: false,
        lectorChecked: false,
        juradoChecked: [],
    });

    const resetCheckedStates = {
        clienteChecked: false,
        directorChecked: false,
        lectorChecked: false,
        juradoChecked: [],
    };

    const guardarSolicitud = async (event) => {
        event.preventDefault();

        if (fecha === '' || fecha === undefined || selectedTime === null) {
            mostrarMensaje("Por favor seleccione un valor de fecha y hora válidos.", "error")

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

                const checkboxesTrue = [];
                if (checkedStates.clienteChecked) checkboxesTrue.push("cliente");
                if (checkedStates.directorChecked) checkboxesTrue.push("director");
                if (checkedStates.lectorChecked) checkboxesTrue.push("lector");
                checkedStates.juradoChecked.forEach((isChecked, index) => {
                    if (isChecked) checkboxesTrue.push(`jurado ${index}`);
                });

                if (checkboxesTrue.length === 0) {
                    mostrarMensaje("Por favor seleccione por lo menos un invitado para la reunión.", "error")

                } else {
                    try {
                        const response = await fetch("http://localhost:5000/proyecto/crearReunionInvitados", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                id: parseInt(ultIdReunion) + 1,
                                nombre: nombre,
                                fecha: fechaHoraFormateada,
                                enlace: link,
                                id_proyecto: parseInt(id),
                                id_estado: 1,
                                director: director,
                                lector: lector,
                                cliente: cliente,
                                jurado: jurado,
                                infoChecked: checkboxesTrue
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
                                Invitados
                            </Typography>
                            <Grid container spacing={0}>
                                <Grid item xs={6}>
                                    {cliente.nombre_repr && (
                                        <React.Fragment>
                                            <Checkbox
                                                checked={clienteChecked}
                                                onChange={handleClienteChange}
                                                color="primary"
                                            />
                                            <Typography variant="body2" display="inline">
                                                Cliente - {cliente.nombre_repr}
                                            </Typography>
                                        </React.Fragment>
                                    )}
                                </Grid>
                                <Grid item xs={6}>
                                    {director.nombre && (
                                        <React.Fragment>
                                            <Checkbox
                                                checked={directorChecked}
                                                onChange={handleDirectorChange}
                                                color="primary"
                                            />
                                            <Typography variant="body2" display="inline">
                                                Director - {director.nombre}
                                            </Typography>
                                        </React.Fragment>
                                    )}
                                </Grid>
                                <Grid item xs={6}>
                                    {lector.nombre && (
                                        <React.Fragment>
                                            <Checkbox
                                                checked={lectorChecked}
                                                onChange={handleLectorChange}
                                                color="primary"
                                            />
                                            <Typography variant="body2" display="inline">
                                                Lector - {lector.nombre}
                                            </Typography>
                                        </React.Fragment>
                                    )}
                                </Grid>
                                {jurado.length > 0 && jurado.map((juradoMember, index) => (
                                    <Grid item xs={6} key={index}>
                                        <Checkbox
                                            checked={juradoChecked[index] || false}
                                            onChange={handleJuradoMemberChange(index)}
                                            color="primary"
                                        />
                                        <Typography variant="body2" display="inline">
                                            Jurado - {juradoMember.nombre}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
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