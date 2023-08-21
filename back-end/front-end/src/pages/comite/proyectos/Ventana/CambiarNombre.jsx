import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, CssBaseline, DialogTitle, Dialog, Button, TextField, DialogActions, DialogContent } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';

function CambiarNombre(props) {

    const { onClose, proyectoNombre, open, ...other } = props;
    const [nombre, setNombre] = useState('');

    const handleEntering = () => {
        setNombre(proyectoNombre)
    };

    const handleCancel = () => {
        onClose();
        setNombre('')
    };

    const handleOk = () => {
        onClose(nombre.trim());
    };
    const handleNombreChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNombre(isOnlyWhitespace ? "" : value);
    };
    return (
        <Dialog open={open} fullWidth maxWidth="md" TransitionProps={{ onEntering: handleEntering }}  {...other} >
            <CssBaseline />
            <form onSubmit={handleOk}>
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
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ width: 150 }}  disabled={nombre === proyectoNombre}>
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
    proyectoNombre: PropTypes.string.isRequired,
};

export default CambiarNombre;
