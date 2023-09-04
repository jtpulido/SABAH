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
import { selectToken } from '../../../../store/authSlice';

function AgregarEstudiante(props) {

    const { onClose, onSubmit, open } = props;

    const id = sessionStorage.getItem('admin_id_proyecto');
    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [num_identificacion, setNum_Identificacion] = useState("");

    const handleCancel = () => {
        setCorreo('')
        setNombre('')
        setNum_Identificacion('')
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

    const handleNumeroASChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setNum_Identificacion(isOnlyWhitespace ? "" : value);
    };

    const agregarEstudiante = async (e) => {
        e.preventDefault();
        try {
            const estudiante = {
                nombre: nombre,
                correo: correo,
                num_identificacion: num_identificacion,
            };
            const response = await fetch(`http://localhost:5000/admin/estudiante/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(estudiante)
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 200) {
                mostrarMensaje(data.message, "success")
                onSubmit(data.estudiantes)
                setCorreo('')
                setNombre('')
                setNum_Identificacion('')
            }
        } catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }

    }

    const correoPattern = /^[a-zA-Z0-9._\-]+@unbosque\.edu\.co$/;
    
    return (
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} >
            <CssBaseline />

            <DialogTitle variant="h1" color="primary">
                Agregar Estudiante
            </DialogTitle>
            <form onSubmit={(e) => agregarEstudiante(e)}>
                <DialogContent dividers>

                    <Typography variant="h6" color="primary">
                        Nombre del estudiante
                    </Typography>
                    <TextField
                        value={nombre}
                        onChange={(e) => handleNombreASChange(e.target.value)}
                        fullWidth
                        error={!nombre}
                        helperText={'Ingresa el nombre del estudiante'}
                        required
                    />
                    <Typography variant="h6" color="primary">
                        Correo del estudiante
                    </Typography>
                    <TextField
                        value={correo}
                        onChange={(e) => handleCorreoASChange(e.target.value)}
                        fullWidth
                        required
                        error={!correoPattern.test(correo) && correo !== ''}
                        helperText={!correoPattern.test(correo) && correo !== '' ? 'El correo Ingresado no es valido.' : ''}
                        InputProps={{
                            inputProps: {
                                pattern: correoPattern.source,
                                title: 'El correo Ingresado no es valido, debe ingresar un correo @unbosque.edu.co',
                            },
                        }}
                    />
                    <Typography variant="h6" color="primary">
                        Número de identificación del estudiante
                    </Typography>
                    <TextField
                        value={num_identificacion}
                        onChange={(e) => handleNumeroASChange(e.target.value)}
                        fullWidth
                        inputProps={{
                            minLength: 5,
                            maxLength: 15,
                        }}
                        error={!num_identificacion}
                        helperText={'Ingresa el número de identificación del estudiante'}
                        required
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

AgregarEstudiante.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default AgregarEstudiante;
