
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Typography,
    CssBaseline,
    DialogTitle,
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    Checkbox,
    Box,
    CircularProgress,
    FormGroup,
    FormControlLabel,
} from "@mui/material";

import { SaveOutlined } from '@mui/icons-material';
import { selectToken } from '../../../../store/authSlice';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

function FinalizarProyecto(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { onClose, proyecto, onSubmit, open, ...other } = props;
    const [respuestasChecked, setRespuestasChecked] = useState([]);
    const [cumplimientos, setCumplimientos] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleEntering = async () => {
        await obtenerCumplimiento();
    };

    const handleCancel = () => {
        onClose();
        setRespuestasChecked([])
        setCumplimientos([])
    };

    const terminarProyecto = async (e) => {
        e.preventDefault();
     
        const allCheckboxesMarked = respuestasChecked.every((checked) => checked);
        if (!allCheckboxesMarked) {
            mostrarMensaje("Solo podrá finalizar el proyecto si cumple con todos los requisitos.", "info");
        } else {
            setIsLoading(true);
            try {
                const response = await fetch(`${apiBaseUrl}/comite/terminarproyecto/${proyecto.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ proyecto: proyecto })
                });
                const data = await response.json();
                if (response.status === 203) {
                    mostrarMensaje(data.message, "warning");
                } else if (data.success) {
                    mostrarMensaje("El proyecto cambio a estado terminado","success");
                    const cambio = {
                        id_estado: data.estado.id,
                        estado: data.estado.nombre
                    };
                    onSubmit(cambio)
                    setRespuestasChecked([])
                    setCumplimientos([])
                } else {
                    mostrarMensaje(data.message, "error");
                }
            } catch (error) {
                mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error");
            }
        }
        setIsLoading(false);
    };

    const obtenerCumplimiento = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/cumplimiento/${proyecto.acronimo}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                setCumplimientos(data.cumplimientos)
                setRespuestasChecked(Array.from({ length: data.cumplimientos.length }, () => false));
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const handleCheckboxChange = (index) => (event) => {
        const newRespuestaStates = [...respuestasChecked];
        newRespuestaStates[index] = event.target.checked;
        setRespuestasChecked(newRespuestaStates)
    };
    return (
        <Dialog open={open} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} {...other}>
            <CssBaseline />
            <DialogTitle variant="h1" color="secondary">Formulario de cumplimiento</DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6" color="textSecondary">
                    Este formulario permitirá dar por finalizado un proyecto, solo podrá finalizarlo si cumple con todos los items.
                </Typography>
                {cumplimientos ? (
                    <FormGroup>
                        {cumplimientos.map((cumplimiento, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={respuestasChecked[index]}
                                        onChange={(event) => handleCheckboxChange(index)(event)}
                                    />
                                }
                                label={cumplimiento.cumplimiento}
                            />
                        ))}
                    </FormGroup>
                ) : (
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>)}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} disabled={isLoading}>
                    Cerrar
                </Button>
                <Button onClick={terminarProyecto} disabled={isLoading} startIcon={<SaveOutlined />} variant="contained" color="primary" sx={{ width: 250 }}>
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

FinalizarProyecto.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    proyecto: PropTypes.object.isRequired,
};

export default FinalizarProyecto;
