import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../../../theme';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    useTheme,
    CircularProgress,
    Box,
    TextField,
    CssBaseline,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent
} from '@mui/material';

import { useSnackbar } from 'notistack';

function CrearAspecto(props) {
    const { onClose, open } = props;
    const { enqueueSnackbar } = useSnackbar();

    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [nombre, setNombre] = useState("");
    const [loading, setLoading] = useState(true);

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
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setNombre("");
                handleCancel()
                mostrarMensaje(data.message, "success")
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };
    return (
        <Dialog open={open} fullWidth maxWidth="md" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} >
            <CssBaseline />

            <DialogTitle variant="h1" color={colors.primary[100]}>
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
                            <TextField
                                label="Nombre del aspecto"
                                value={nombre}
                                required
                                onChange={(e) => handleNombreASChange(e.target.value)}
                                fullWidth
                                margin="normal"
                                error={!nombre}
                                helperText={'Ingresa el nombre del aspecto'}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button variant="contained" type='submit'>
                        Crear Aspecto
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CrearAspecto.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

export default CrearAspecto;
