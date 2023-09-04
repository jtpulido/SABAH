import React, { useState } from 'react';
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

function AgregarUsuario(props) {

    const { onClose, onSubmit, open } = props;
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

    const agregarUsuario = async (e) => {
        e.preventDefault();
        try {
            const usuario = {
                nombre: nombre,
                correo: correo,
            };
            const response = await fetch(`http://localhost:5000/admin/agregarUsuario`, {
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
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} >
            <CssBaseline />

            <DialogTitle variant="h1" color="primary">
                Agregar Usuario
            </DialogTitle>
            <form onSubmit={(e) => agregarUsuario(e)}>
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

AgregarUsuario.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default AgregarUsuario;
