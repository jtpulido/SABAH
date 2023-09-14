import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    TextField,
    CssBaseline,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent,
    Typography
} from '@mui/material';

import { SaveOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../store/authSlice';

function ModificarUsuario(props) {

    const { onClose, onSubmit, open, id } = props;
    const token = useSelector(selectToken);
    const correoPattern = /^[a-zA-Z0-9._\-]+@unbosque\.edu\.co$/;

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");

    const handleCancel = () => {
        setCorreo('');
        setNombre('');
        onClose();
    };

    const handleNombreASChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    const handleCorreoASChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setCorreo(isOnlyWhitespace ? "" : value);
    };
    const handleEntering = async () => {
        infoUsuario()
    }
    const infoUsuario = async () => {
        try {
            const response = await fetch(`http://localhost:5000/admin/verUsuario/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                setNombre(data.infoUsuario[0].nombre);
                setCorreo(data.infoUsuario[0].correo);
            }
        }
        catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    }

    const modificarUsuario = async (e) => {
        e.preventDefault();
        try {
            const usuario = {
                id: id,
                nombre: nombre,
                correo: correo,
            };
            const response = await fetch(`http://localhost:5000/admin/modificarUsuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(usuario)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else {
                mostrarMensaje(data.message, "success");
                handleCancel();
            }
        } catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <CssBaseline />

            <DialogTitle variant="h1" color="primary">
                Modificar Usuario
            </DialogTitle>
            <form onSubmit={(e) => modificarUsuario(e)}>
                <DialogContent dividers>

                    <Typography variant="h6" color="primary">
                        Nombre del usuario
                    </Typography>
                    <TextField
                        value={nombre}
                        onChange={(e) => handleNombreASChange(e.target.value)}
                        fullWidth
                        error={!nombre}
                        required
                    />
                    <Typography variant="h6" color="primary" sx={{ mt: '15px' }}>
                        Correo del usuario
                    </Typography>
                    <TextField
                        value={correo}
                        onChange={(e) => handleCorreoASChange(e.target.value)}
                        fullWidth
                        required
                        error={!correoPattern.test(correo) && correo !== ''}
                        helperText={!correoPattern.test(correo) && correo !== '' ? 'El correo ingresado no es válido.' : ''}
                        InputProps={{
                            inputProps: {
                                pattern: correoPattern.source,
                                title: 'No fue ingresado una dirección de correo electrónico institucional válida (@unbosque.edu.co).',
                            },
                        }}
                        sx={{ mb: '5px' }}
                    />

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

ModificarUsuario.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired
};

export default ModificarUsuario;
