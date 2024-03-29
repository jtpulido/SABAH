import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    CircularProgress,
    Box,
    TextField,
    CssBaseline,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent,
    Typography
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { SaveOutlined } from '@mui/icons-material';

function CrearAspecto(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { onClose, onSubmit, open } = props;
    const { enqueueSnackbar } = useSnackbar();

    const token = useSelector(selectToken);

    const [nombre, setNombre] = useState("");
    const [loading, setLoading] = useState(true);

    const [isLoading, setIsLoading] = useState(false);

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleEntering = () => {
        setLoading(false);
    };
    const handleCancel = () => {
        onClose();
        setLoading(true);
    };
    const handleNombreASChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    const crearAspecto = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/comite/aspecto`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setNombre("");
                onSubmit()
                mostrarMensaje(data.message, "success")
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
        setIsLoading(false);
    };
    return (
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} >
            <CssBaseline />

            <DialogTitle variant="h1" color="primary">
                CREAR ASPECTO
            </DialogTitle>
            <form onSubmit={crearAspecto}>
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color="primary">
                                Nombre del aspecto
                            </Typography>
                            <TextField
                                value={nombre}
                                onChange={(e) => handleNombreASChange(e.target.value)}
                                fullWidth
                                error={!nombre}
                                helperText={'Ingresa el nombre del aspecto'}
                                required
                            />
                        </>
                    )}
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

CrearAspecto.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default CrearAspecto;
