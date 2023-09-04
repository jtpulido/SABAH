import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, CssBaseline, DialogTitle, Dialog, Button, TextField, DialogActions, DialogContent } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { selectToken } from '../../../../store/authSlice';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

function CambiarNombre(props) {

    const { onClose, proyectoNombre, onSubmit, open, ...other } = props;
    const id = sessionStorage.getItem('admin_id_proyecto');
    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    
    const [nombre, setNombre] = useState('');

    const handleEntering = () => {
        setNombre(proyectoNombre)
    };

    const handleCancel = () => {
        onClose();
        setNombre('')
    };

    const modificarNombre = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/admin/cambiarNombre", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: id, nombre: nombre.trim() })
            });
            const data = await response.json();
            if (data.success) {
                mostrarMensaje("Se ha actualizado el nombre del proyecto.", "success");
                onSubmit(nombre.trim())
                setNombre('')
            } else {
                mostrarMensaje(data.message, "error")
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
    };

    const handleNombreChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };

    return (
        <Dialog open={open} fullWidth maxWidth="md" TransitionProps={{ onEntering: handleEntering }} onClose={handleCancel} {...other} >
            <CssBaseline />
            <form onSubmit={(e) =>modificarNombre(e)}>
                <DialogTitle variant="h1" color="secondary">Cambiar nombre</DialogTitle>
                <DialogContent dividers >
                    <Typography variant="h6" color="primary">
                        Nuevo nombre
                    </Typography>
                    <TextField
                        autoFocus
                        value={nombre}
                        onChange={(e) => handleNombreChange(e.target.value)}
                        variant="standard"
                        fullWidth error={!nombre}
                        helperText={'Ingresa el nombre del proyecto.'}
                        multiline
                        required
                    />


                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ width: 150 }} disabled={nombre === proyectoNombre}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CambiarNombre.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    proyectoNombre: PropTypes.string.isRequired,
};

export default CambiarNombre;
