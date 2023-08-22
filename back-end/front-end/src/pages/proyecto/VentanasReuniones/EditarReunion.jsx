import React, { useState, useEffect, useCallback } from 'react';
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

function EditarReunion(props) {

    const id = sessionStorage.getItem('id_proyecto');
    const idReunion = sessionStorage.getItem('proyecto_id_reunion');
    const token = useSelector(selectToken);

    const reunionCadena = sessionStorage.getItem('info_reunion_editar');
    const reunion = JSON.parse(reunionCadena);

    const [invitados, setInvitados] = useState([]);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");
    const [fecha, setFecha] = useState('');
    const [selectedTime, setSelectedTime] = useState(true);

    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [jurado, setJurado] = useState([]);
    const [cliente, setCliente] = useState([]);

    const [checkBoxesInicial, setCheckboxesInicial] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const obtenerInfoDirector = async () => {
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
    };

    const obtenerInfoLector = async () => {
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
    };

    const obtenerInfoJurado = async () => {
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
    };

    const obtenerInfoCliente = async () => {
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
    };

    const handleEntering = async () => {
        try {
            await Promise.all([
                obtenerInfoDirector(),
                obtenerInfoLector(),
                obtenerInfoJurado(),
                obtenerInfoCliente()
            ]);

            setNombre(reunion.nombre);
            setLink(reunion.enlace);
            const fechaHoraArray = reunion.fecha.split(' ');
            const fechaReunion = fechaHoraArray[0];
            const horaReunion = fechaHoraArray[1];
            setFecha(dayjs(fechaReunion, 'DD-MM-YYYY'));
            setSelectedTime(dayjs(horaReunion, 'HH:mm'));

        } catch (error) {
            mostrarMensaje("Ocurrió un error al obtener la información. Por favor, inténtalo de nuevo más tarde.", "error");
        }
    };

    useEffect(() => {

        const obtenerInvitados = async () => {
            try {
                const response = await fetch(`http://localhost:5000/proyecto/obtenerInvitados/${idReunion}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (!data.success) {
                    mostrarMensaje(data.message, 'error');
                } else {
                    setInvitados(data.invitados);
                    const invitadosCliente = data.invitados.map(invitado => invitado.nombre_repr);
                    const invitadosUsuarios = data.invitados
                        .filter(invitado => invitado.nombre_usuario !== null)
                        .map(invitado => invitado.nombre_usuario);

                    setClienteChecked(invitadosCliente.includes(cliente.nombre_repr));
                    setDirectorChecked(invitadosUsuarios.includes(director.nombre));
                    setLectorChecked(invitadosUsuarios.includes(lector.nombre));
                    const newJuradoChecked = jurado.map(juradoMember => invitadosUsuarios.includes(juradoMember.nombre));
                    setJuradoChecked(newJuradoChecked);

                }
            }
            catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
            }
        };

        if (director.nombre && lector.nombre && cliente.nombre_repr && jurado) {
            obtenerInvitados();
        }
    }, [director, lector, cliente, jurado, idReunion, token, mostrarMensaje]);

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
        sessionStorage.removeItem('info_reunion_editar');
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

    useEffect(() => {
        if (invitados[0]) {
            const checkboxesTrue = [];
            if (clienteChecked) checkboxesTrue.push("cliente");
            if (directorChecked) checkboxesTrue.push("director");
            if (lectorChecked) checkboxesTrue.push("lector");
            juradoChecked.forEach((isChecked, index) => {
                if (isChecked) checkboxesTrue.push(`jurado ${index}`);
            });
            setCheckboxesInicial(checkboxesTrue);
        }

    }, [invitados]);

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

                const checkboxesFinal = [];
                if (clienteChecked) checkboxesFinal.push("cliente");
                if (directorChecked) checkboxesFinal.push("director");
                if (lectorChecked) checkboxesFinal.push("lector");
                juradoChecked.forEach((isChecked, index) => {
                    if (isChecked) checkboxesFinal.push(`jurado ${index}`);
                });

                if (checkboxesFinal.length === 0) {
                    mostrarMensaje("Por favor seleccione por lo menos un invitado para la reunión.", "error")
                } else {
                    if (nombre === reunion.nombre && link === reunion.enlace && fechaHoraFormateada === reunion.fecha && JSON.stringify(checkBoxesInicial) === JSON.stringify(checkboxesFinal)) {
                        mostrarMensaje("No se ha modificado ninguna información de la reunión.", "error");
                    } else {
                        const addedRoles = checkboxesFinal.filter(role => !checkBoxesInicial.includes(role));
                        const removedRoles = checkBoxesInicial.filter(role => !checkboxesFinal.includes(role));
                        try {
                            const response = await fetch("http://localhost:5000/proyecto/editarReunion", {
                                method: "POST",
                                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({
                                    id: idReunion,
                                    id_proyecto: id,
                                    nombre: nombre,
                                    fecha: fechaHoraFormateada,
                                    enlace: link,
                                    director: director,
                                    lector: lector,
                                    cliente: cliente,
                                    jurado: jurado,
                                    added: addedRoles,
                                    removed: removedRoles
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
EditarReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default EditarReunion;