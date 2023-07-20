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
    IconButton,
    Typography
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { Edit, SaveOutlined } from '@mui/icons-material';

function VerModificarAspecto(props) {
    const { onClose, onSubmit, open, aspecto } = props;
    const { enqueueSnackbar } = useSnackbar();

    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [nombre, setNombre] = useState("");
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleEntering = () => {
        setNombre(aspecto.nombre)
        setLoading(false);
    };
    const handleCancel = () => {
        onClose();
        setLoading(true);
    };
    const habilitarEdicion = () => {
        setEditMode(!editMode);
    };
    const handleNombreASChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    const modificarAspecto = async () => {
        try {
            const response = await fetch(`http://localhost:5000/comite/aspecto/${aspecto.id}`, {
                method: "PUT",
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
                VER/MODIFICAR ASPECTO

                <IconButton onClick={habilitarEdicion}>
                    <Edit />
                </IconButton>
            </DialogTitle>
            <form onSubmit={modificarAspecto}>
                <DialogContent dividers>
                    <Typography variant="h6">
                    Al modificar un aspecto, cambiará en todas las rúbricas que lo esten utilizando.
                    </Typography>

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
                                required
                                onChange={(e) => handleNombreASChange(e.target.value)}
                                fullWidth
                                margin="normal"
                                error={!nombre}
                                helperText={'Ingresa el nombre del aspecto'}
                                disabled={!editMode}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" disabled={!editMode} startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

VerModificarAspecto.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    aspecto: PropTypes.object.isRequired
};

export default VerModificarAspecto;
