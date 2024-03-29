import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import PropTypes from 'prop-types';
import { TextField, Button, Dialog, Typography, Slide, DialogContent, DialogTitle, DialogActions, Grid } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function CancelarReunion(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const id = sessionStorage.getItem('user_id_usuario');
    const idRol = sessionStorage.getItem('id_rol');
    const idReunion = sessionStorage.getItem('usuario_id_reunion');
    const token = useSelector(selectToken);

    const { onClose, onSubmit, open, ...other } = props;

    const [justificacion, setJustificacion] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleJustificacionChange = (event) => {
        const value = event.target.value;
        const isOnlyWhitespace = /^\s*$/.test(value);
        setJustificacion(isOnlyWhitespace ? "" : value);
    };

    const handleCancel = () => {
        onClose();
        setJustificacion("");
    };

    const guardarSolicitud = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/usuario/cancelarReunion`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id_reunion: parseInt(idReunion),
                    justificacion: justificacion,
                    id_usuario: id, 
                    id_rol: idRol
                })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                mostrarMensaje(data.message, "success");
                onSubmit()
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
        setIsLoading(false);
    };

    return (
        <Dialog maxWidth="sm" fullWidth TransitionComponent={Transition} open={open} {...other} onClose={handleCancel}>
            <form onSubmit={guardarSolicitud}>
                <DialogTitle variant="h1" color="primary">
                    CANCELAR REUNIÓN
                </DialogTitle>

                <DialogContent dividers >
                    <Grid container spacing={2}>

                        <Grid item xs={12} >
                            <Typography variant="h6" color="primary">
                                Justificación
                            </Typography>
                            <TextField
                                value={justificacion}
                                onChange={handleJustificacionChange}
                                multiline
                                rows={3}
                                required
                                fullWidth
                                error={!justificacion}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} disabled={isLoading}>Cerrar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading} startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }}>
                        Cancelar
                    </Button>
                </DialogActions>
            </form>
        </Dialog >
    );
}
CancelarReunion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CancelarReunion;