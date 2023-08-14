import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Select, MenuItem, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid, Checkbox } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CrearReunion(props) {

    const token = useSelector(selectToken);

    const id_usuario = sessionStorage.getItem('user_id_usuario');
    const { onClose, onSubmit, open, ...other } = props;

    const [nombre, setNombre] = useState("");
    const [link, setLink] = useState("");

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
            id_proyecto: idProyecto,
            creado_proyecto: false
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
        setNombre("");
    };

    const [clienteChecked, setClienteChecked] = useState(false);

    const handleClienteChange = (event) => {
        setClienteChecked(event.target.checked);
    };

    const [directorChecked, setDirectorChecked] = useState(false);

    const handleDirectorChange = (event) => {
        setDirectorChecked(event.target.checked);
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
                                Fecha y Hora
                            </Typography>
                            <Select
                                value={idProyecto}
                                onChange={handleIdProyectoChange}
                                required
                                fullWidth
                                error={idProyecto === ""}
                                helperText={'Selecciona la fecha y hora'}
                            >
                                {proyectos.map((proyecto) => (
                                    <MenuItem key={proyecto.id} value={proyecto.id}>
                                        {proyecto.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
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
                                helperText={'Ingresa el nombre de la reunión'}
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
                                helperText={'Ingrese el link de la reunión'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                                Invitados
                            </Typography>
                            <Checkbox
                                checked={clienteChecked}
                                onChange={handleClienteChange}
                                color="primary"
                                inputProps={{ 'aria-label': 'invitados checkbox' }}
                            />
                            <Checkbox
                                checked={directorChecked}
                                onChange={handleDirectorChange}
                                color="primary"
                                inputProps={{ 'aria-label': 'invitados checkbox' }}
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
CrearReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CrearReunion;