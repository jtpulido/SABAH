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

    const id = sessionStorage.getItem('comite_id_proyecto');
    const idReunion = sessionStorage.getItem('proyecto_id_reunion');
    const token = useSelector(selectToken);

    const reunionCadena = sessionStorage.getItem('info_reunion_ver');
    const reunion = JSON.parse(reunionCadena);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState('');
    const [link, setLink] = useState('');
    const [fecha, setFecha] = useState('');
    const [justificacion, setJustificacion] = useState('');
    const [selectedTime, setSelectedTime] = useState(true);
    const [nombreProyecto, setNombreProyecto] = useState('');

    const [director, setDirector] = useState([]);
    const [lector, setLector] = useState([]);
    const [jurado, setJurado] = useState([]);
    const [cliente, setCliente] = useState([]);

    const [directorInicial, setDirectorInicial] = useState(false);
    const [lectorInicial, setLectorInicial] = useState(false);
    const [juradoInicial, setJuradoInicial] = useState(false);
    const [clienteInicial, setClienteInicial] = useState(false);

    const [directorChecked, setDirectorChecked] = useState(false);
    const [lectorChecked, setLectorChecked] = useState(false);
    const [juradoChecked, setJuradoChecked] = useState([]);
    const [clienteChecked, setClienteChecked] = useState(false);

    const [directorAsistencia, setDirectorAsistencia] = useState('');
    const [lectorAsistencia, setLectorAsistencia] = useState('');
    const [juradoAsistencia, setJuradoAsistencia] = useState([]);
    const [clienteAsistencia, setClienteAsistencia] = useState('');

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = useCallback((mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    }, [enqueueSnackbar]);

    const obtenerInfoDirector = async () => {
        try {
            const response = await fetch(`http://localhost:5000/comite/obtenerInfoDirector/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setDirector(data.director);
                setDirectorInicial(true);
            } else if (response.status === 203) {
                setDirectorInicial(true);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerInfoLector = async () => {
        try {
            const response = await fetch(`http://localhost:5000/comite/obtenerInfoLector/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setLector(data.lector);
                setLectorInicial(true);
            } else if (response.status === 203) {
                setLectorInicial(true);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerInfoJurado = async () => {
        try {
            const response = await fetch(`http://localhost:5000/comite/obtenerInfoJurado/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setJurado(data.jurado);
                setJuradoInicial(true);
            } else if (response.status === 203) {
                setJuradoInicial(true);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerInfoCliente = async () => {
        try {
            const response = await fetch(`http://localhost:5000/comite/obtenerInfoCliente/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setCliente(data.cliente);
                setClienteInicial(true);
            } else if (response.status === 203) {
                setClienteInicial(true);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const handleEntering = async () => {
        try {
            await Promise.allSettled([
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
            setNombreProyecto(reunion.nombre_proyecto)

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

                    const asistencia = {};
                    data.invitados
                        .filter(invitado => invitado.nombre !== null)
                        .forEach(invitado => {
                            asistencia[invitado.nombre] = invitado.nombre_asistencia;
                        });

                    setClienteAsistencia(asistencia[cliente.nombre_repr] || '');
                    setDirectorAsistencia(asistencia[director.nombre] || '');
                    setLectorAsistencia(asistencia[lector.nombre] || '');
                    const newJuradoAsistencias = jurado.map(juradoMember => asistencia[juradoMember.nombre] || '');
                    setJuradoAsistencia(newJuradoAsistencias);

                }
            }
            catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
            }
        };

        if (directorInicial && lectorInicial && clienteInicial && juradoInicial) {
            obtenerInvitados();
        }
    }, [directorInicial, lectorInicial, clienteInicial, juradoInicial, idReunion, token, mostrarMensaje]);

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
        setDirectorInicial(false);
        setLectorInicial(false);
        setClienteInicial(false);
        setJuradoInicial(false);
        setFecha('');
        setDirector([]);
        setLector([]);
        setJurado([]);
        setCliente([]);
        setNombreProyecto('');
        sessionStorage.removeItem('info_reunion_ver');
    };

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
                            Enlace/Lugar
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
                            Nombre Proyecto
                        </Typography>
                        <TextField
                            value={nombreProyecto}
                            multiline
                            rows={1}
                            required
                            fullWidth
                            spellCheck={false}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={0}>
                            <Grid item xs={6}>
                                <Typography variant="h6" color="primary">
                                    Invitados
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="h6" color="primary">
                                    Asistencia
                                </Typography>
                            </Grid>
                        </Grid >
                        <Grid container spacing={0} sx={{ mb: '10px' }}>
                            {cliente.nombre_repr && (
                                <>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs={6}>
                                            <Checkbox checked={clienteChecked} color="primary" />
                                            <Typography variant="body2" display="inline">
                                                Cliente - {cliente.nombre_repr}
                                            </Typography>
                                        </Grid>
                                        {clienteChecked && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2" display="inline">
                                                    {clienteAsistencia || "Sin especificar"}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </>
                            )}

                            {director.nombre && (
                                <>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs={6}>
                                            <React.Fragment>
                                                <Checkbox
                                                    checked={directorChecked}
                                                    color="primary"
                                                />
                                                <Typography variant="body2" display="inline">
                                                    Director - {director.nombre}
                                                </Typography>
                                            </React.Fragment>
                                        </Grid>
                                        {directorChecked && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2" display="inline">
                                                    {directorAsistencia || "Sin especificar"}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </>
                            )}
                            {lector.nombre && (
                                <>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs={6}>
                                            <React.Fragment>
                                                <Checkbox
                                                    checked={lectorChecked}
                                                    color="primary"
                                                />
                                                <Typography variant="body2" display="inline">
                                                    Lector - {lector.nombre}
                                                </Typography>
                                            </React.Fragment>
                                        </Grid>
                                        {lectorChecked && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2" display="inline">
                                                    {lectorAsistencia || "Sin especificar"}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </>
                            )}
                            {jurado.length > 0 && jurado.map((juradoMember, index) => (
                                <>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item xs={6} key={index}>
                                            <Checkbox
                                                checked={juradoChecked[index] || false}
                                                color="primary"
                                            />
                                            <Typography variant="body2" display="inline">
                                                Jurado - {juradoMember.nombre}
                                            </Typography>
                                        </Grid>
                                        {juradoChecked[index] && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2" display="inline" sx={{ mt: '10px' }}>
                                                    {juradoAsistencia[index] || "Sin especificar"}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </>
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
        </Dialog >
    );
}
VerReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default VerReunion;