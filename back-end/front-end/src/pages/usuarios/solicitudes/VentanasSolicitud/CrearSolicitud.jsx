import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Select, MenuItem, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CrearSolicitud(props) {
    const token = useSelector(selectToken);

    const id_usuario= sessionStorage.getItem('user_id_usuario');
    const { onClose, onSubmit, open, ...other } = props;

    const [justificacion, setJustificacion] = useState("");
    const [idTipo, setIdTipo] = useState("");
    const [idProyecto, setIdProyecto] = useState("");

    const [tipos, setTipos] = useState([]);
    const [proyectos, setProyectos] = useState([]);

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
    const obtenerProyectos = async () => {
        try {
            const response = await fetch(`http://localhost:5000/usuario/obtenerProyectos/${id_usuario}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setProyectos(data.proyectos);
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
    const handleIdProyectoChange = (event) => {
        setIdProyecto(event.target.value);
    };

    const guardarSolicitud = async (event) => {
        event.preventDefault();
        const solicitudData = {
            justificacion,
            id_tipo_solicitud: idTipo,
            id_proyecto:idProyecto,
            creado_proyecto:false
        };
        try {
            const response = await fetch("http://localhost:5000/usuario/guardarSolicitud", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(solicitudData)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else {
                onSubmit();
                setJustificacion("");
                setIdTipo("");
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const handleEntering = async () => {
        obtenerTiposSolicitudes();
        obtenerProyectos()
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
                                Proyecto
                            </Typography>
                            <Select
                                value={idProyecto}
                                onChange={handleIdProyectoChange}
                                required
                                fullWidth
                                error={idProyecto === ""}
                                helperText={'Selecciona el tipo de solicitud'}
                            >
                                {proyectos.map((proyecto) => (
                                    <MenuItem key={proyecto.id} value={proyecto.id}>
                                        {proyecto.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
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
CrearSolicitud.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CrearSolicitud;