import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Select, MenuItem, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CrearSolicitud(props) {
    const token = useSelector(selectToken);

    const id = sessionStorage.getItem('id_proyecto');
    const { onClose, onSubmit, open, ...other } = props;

    const [justificacion, setJustificacion] = useState("");
    const [idTipo, setIdTipo] = useState("");
    const [tipos, setTipos] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const obtenerTiposSolicitudes = async () => {
        try {
            const response = await fetch("http://localhost:5000/proyecto/tipoSolicitud", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setTipos(data.tipos);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleJustificacionChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setJustificacion(isOnlyWhitespace ? "" : value);
    };

    const handleIdTipoChange = (event) => {
        setIdTipo(event.target.value);
    };

    const guardarSolicitud = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const solicitudData = {
            justificacion,
            id_tipo_solicitud: idTipo,
            id_proyecto: id,
            creado_proyecto: true
        };
        try {
            const response = await fetch("http://localhost:5000/proyecto/guardarSolicitud", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(solicitudData)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                mostrarMensaje(data.message, "success");
                onSubmit();
                setJustificacion("");
                setIdTipo("");
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
        setIsLoading(false);
    };

    const handleEntering = async () => {
        obtenerTiposSolicitudes();
    }

    const handleCancel = () => {
        onClose();
        setJustificacion("");
        setIdTipo("");

    };

    return (
        <Dialog maxWidth="sm" fullWidth TransitionComponent={Transition} open={open} {...other} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <form onSubmit={guardarSolicitud}>
                <DialogTitle variant="h1" color="primary">
                    CREAR SOLICITUD
                </DialogTitle>

                <DialogContent dividers >
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <Typography variant="h6" color="primary">
                                Tipo de solicitud
                            </Typography>
                            <Select
                                value={idTipo}
                                onChange={handleIdTipoChange}
                                required
                                fullWidth
                                error={idTipo === ""}
                                helperText={'Selecciona el tipo de solicitud'}
                            >
                                {tipos.map((tipo) => (
                                    <MenuItem key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Descripción
                            </Typography>
                            <TextField
                                value={justificacion}
                                onChange={handleJustificacionChange}
                                multiline
                                rows={2}
                                required
                                fullWidth
                                error={!justificacion}
                                helperText={'Ingresa la descripción del espacio'}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} disabled={isLoading}>Cerrar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading} startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>

    );
}
CrearSolicitud.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CrearSolicitud;