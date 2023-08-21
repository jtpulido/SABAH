import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Button, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function VerReunion(props) {

    const reunionCadena = sessionStorage.getItem('usuario_reunion_ver');
    const reunion = JSON.parse(reunionCadena);

    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");
    const [fecha, setFecha] = useState('');
    const [justificacion, setJustificacion] = useState("");
    const [selectedTime, setSelectedTime] = useState(true);

    const [proyecto, setProyecto] = useState("");
    const [asistencia, setAsistencia] = useState("");

    const handleEntering = async () => {
        setNombre(reunion.nombre);
        setLink(reunion.enlace);
        setJustificacion(reunion.justificacion);
        const fechaHoraArray = reunion.fecha.split(' ');
        const fechaReunion = fechaHoraArray[0];
        const horaReunion = fechaHoraArray[1];
        setFecha(fechaReunion);
        setSelectedTime(horaReunion);
        setProyecto(reunion.nombre_proyecto);
        setAsistencia(reunion.nombre_asistencia);
    };

    const handleCancel = () => {
        onClose();
        setLink("");
        setNombre("");
        setJustificacion("");
        setSelectedTime(null);
        setFecha("");
        setProyecto("");
        setAsistencia("");
        sessionStorage.removeItem('usuario_reunion_ver');
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
                            Proyecto
                        </Typography>
                        <TextField
                            value={proyecto}
                            multiline
                            rows={1}
                            fullWidth
                        />
                    </Grid>

                    {asistencia && (
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Asistencia
                            </Typography>
                            <TextField
                                value={asistencia}
                                multiline
                                rows={1}
                                fullWidth
                            />
                        </Grid>
                    )}

                    {justificacion && (
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Justificación
                            </Typography>
                            <TextField
                                value={justificacion}
                                multiline
                                rowsMax={Infinity}
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