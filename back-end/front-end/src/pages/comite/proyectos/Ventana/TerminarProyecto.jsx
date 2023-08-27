
import React, { useEffect, useState } from 'react';
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
    
    const { onClose, proyecto, onSubmit, open, ...other } = props;
    const [respuestasChecked, setRespuestasChecked] = useState([]);
    const [cumplimientos, setCumplimientos] = useState([]);

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
    };

    const terminarProyecto = async (e) => {
        e.preventDefault();

        mostrarMensaje("Solo podra finalizar el proyecto si cumple con todos los requisitos.", "info");

        try {
            const response = await fetch(`http://localhost:5000/comite/terminarproyecto/${proyecto.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ proyecto: proyecto })
            });
            const data = await response.json();
            if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (data.success) {
                mostrarMensaje("Ok", "success");
            } else {
                mostrarMensaje(data.message, "error");
            }
        } catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error");
        }
    };

    const obtenerCumplimiento = async () => {
        try {
            const response = await fetch(`http://localhost:5000/comite/cumplimiento/${proyecto.acronimo}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                const nuevosCumplimientos = (data.cumplimientos).map(cumplimiento => ({
                    ...cumplimiento,
                    checked: false
                }));
                setCumplimientos(nuevosCumplimientos)
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const [checkedStates, setCheckedStates] = useState({

        respuestasChecked: [],
    });

    
    const handleCheckboxChange = (index) => (event) => {
        setCheckedStates((prevState) => {
            const newRespuestaStates = [...prevState.respuestasChecked];
            newRespuestaStates[index] = event.target.checked;
            return {
                ...prevState,
                respuestasChecked: newRespuestaStates,
            };
        });
        const newRespuestaStates = [...respuestasChecked];
        newRespuestaStates[index] = event.target.checked;
        setRespuestasChecked(newRespuestaStates);
    };
    return (
        <Dialog open={open} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} {...other}>
            <CssBaseline />
            <DialogTitle variant="h1" color="secondary">Formulario de cumplimiento</DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6" color="textSecondary">
                    Este formulario permitirá dar por finalizado un proyecto, solo podrá finalizarlo si cumple con todos los
                </Typography>
                {cumplimientos ? (
                    <FormGroup>
                        {cumplimientos.map((cumplimiento, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={respuestasChecked[index]}
                                        onChange={() => handleCheckboxChange(index)
                                        }
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
                <Button onClick={handleCancel}>
                    Cerrar
                </Button>
                <Button onClick={terminarProyecto} startIcon={<SaveOutlined />} variant="contained" color="primary" sx={{ width: 250 }}>
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
