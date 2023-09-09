import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid, Checkbox } from "@mui/material";
import { useSnackbar } from 'notistack';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function VerReunion(props) {

    const id = sessionStorage.getItem('id_proyecto');
    const idReunion = sessionStorage.getItem('proyecto_id_reunion');
    const token = useSelector(selectToken);

    const reunionCadena = sessionStorage.getItem('info_reunion_ver');
    const reunion = JSON.parse(reunionCadena);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");
    const [fecha, setFecha] = useState('');
    const [justificacion, setJustificacion] = useState("");
    const [selectedTime, setSelectedTime] = useState(true);

    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [jurado, setJurado] = useState([]);
    const [cliente, setCliente] = useState([]);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const obtenerInfoDirector = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/obtenerInfoDirector", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "info")
            } else {
                setDirector(data.director);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerInfoLector = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/obtenerInfoLector", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "info")
            } else {
                setLector(data.lector);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerInfoJurado = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/obtenerInfoJurado", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "info")
            } else {
                setJurado(data.jurado);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerInfoCliente = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/obtenerInfoCliente", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "info")
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
            setJustificacion(reunion.justificacion);
            const fechaHoraArray = reunion.fecha.split(' ');
            const fechaReunion = fechaHoraArray[0];
            const horaReunion = fechaHoraArray[1];
            setFecha(fechaReunion);
            setSelectedTime(horaReunion);

        } catch (error) {
            mostrarMensaje("Ocurrió un error al obtener la información. Por favor, inténtalo de nuevo más tarde.", "error");
        }
    };

    useEffect(() => {

        const obtenerInvitados = async () => {
            try {
                const response = await fetch(`http://localhost:5000/comite/obtenerInvitados/${idReunion}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (!data.success) {
                    mostrarMensaje(data.message, 'error');
                } else {
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

    const handleCancel = () => {
        onClose();
        setLink("");
        setNombre("");
        setJustificacion("");
        setSelectedTime(null);
        setDirectorChecked(false);
        setLectorChecked(false);
        setJuradoChecked([]);
        setClienteChecked(false);
        setFecha('');
        sessionStorage.removeItem('info_reunion_ver');
    };

    const [directorChecked, setDirectorChecked] = useState(false);
    const [lectorChecked, setLectorChecked] = useState(false);
    const [juradoChecked, setJuradoChecked] = useState([]);
    const [clienteChecked, setClienteChecked] = useState(false);

    return (
        <Dialog maxWidth="sm" fullWidth TransitionComponent={Transition} open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <DialogTitle variant="h1" color="primary">
                VER REUNIÓN
            </DialogTitle>

            <DialogContent dividers >
                <Grid container spacing={2}>
                    <Grid item xs={6} >
                        <Typography variant="h6" color="primary">
                            Fecha
                        </Typography>
                        <TextField
                            value={fecha}
                            multiline
                            rows={1}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" color="primary">
                            Hora
                        </Typography>
                        <TextField
                            value={selectedTime}
                            multiline
                            rows={1}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} >
                        <Typography variant="h6" color="primary">
                            Nombre
                        </Typography>
                        <TextField
                            value={nombre}
                            multiline
                            rows={1}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" color="primary">
                            Link
                        </Typography>
                        <TextField
                            value={link}
                            multiline
                            rows={1}
                            required
                            fullWidth
                            spellCheck={false}
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
                                        color="primary"
                                    />
                                    <Typography variant="body2" display="inline">
                                        Jurado - {juradoMember.nombre}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {justificacion && (
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Justificación
                            </Typography>
                            <TextField
                                value={justificacion}
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                    )}

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}
VerReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default VerReunion;