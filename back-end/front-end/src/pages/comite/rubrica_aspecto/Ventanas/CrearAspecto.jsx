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
    DialogContent,
    Typography
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { SaveOutlined } from '@mui/icons-material';

function CrearAspecto(props) {
    const { onClose,onSubmit, open } = props;
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
                onSubmit()
                mostrarMensaje(data.message, "success")
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };
    return (
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} >
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
                            <Typography variant="h6" color={colors.primary[100]}>
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
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} >
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
