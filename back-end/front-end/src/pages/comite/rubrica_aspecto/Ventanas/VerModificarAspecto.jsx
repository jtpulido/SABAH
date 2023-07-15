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
    IconButton
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { Edit, EditAttributes } from '@mui/icons-material';

function VerModificarAspecto(props) {
    const { onClose, open, aspecto } = props;
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
        setLoading(false);
        setNombre(aspecto.nombre)
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
                VER/MODIFICAR RUBRICA
                <IconButton onClick={habilitarEdicion}>
                    <Edit />
                </IconButton>
            </DialogTitle>
            <form onSubmit={modificarAspecto}>
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
                                disabled={!editMode}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button variant="contained" type='submit' disabled={!editMode}>
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

VerModificarAspecto.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    aspecto: PropTypes.object.isRequired
};

export default VerModificarAspecto;
