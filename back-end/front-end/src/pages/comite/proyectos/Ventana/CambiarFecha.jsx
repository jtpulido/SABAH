import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, DialogTitle, Dialog, Button, DialogActions, DialogContent } from "@mui/material";
import { CalendarMonth, SaveOutlined } from '@mui/icons-material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import { useSnackbar } from 'notistack';

function CambiarFecha(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { onClose, estudiante, onSubmit, open, ...other } = props;
    const id = sessionStorage.getItem('id_proyecto');
    const token = useSelector(selectToken);

    const [isLoading, setIsLoading] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const [fechaGrado, setFechaGrado] = useState('');

    const handleEntering = () => {
        setFechaGrado(dayjs(estudiante.fecha_grado, 'DD-MM-YYYY'))
    };

    const handleCancel = () => {
        onClose();
        setFechaGrado('')
    };

    const modificarFechaGrado = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/comite/estudiante/cambiarfecha`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_proyecto: id, id_estudiante: estudiante.id_estudiante, fecha_grado: fechaGrado })
            });
            const data = await response.json();
            if (data.success) {
                onSubmit(data.estudiantes)
                mostrarMensaje("Se ha actualizado la fecha de grado", "success");
                setFechaGrado('')
            } else {
                mostrarMensaje(data.message, "error")
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
        setIsLoading(false);
    };


    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} onClose={handleCancel} {...other} >
            <form onSubmit={(e) => modificarFechaGrado(e)}>
                <DialogTitle variant="h1" color="secondary">Cambiar Fecha de Grado</DialogTitle>
                <DialogContent dividers >

                    <Typography variant="h6" color="primary">
                        Fecha
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            required
                            value={fechaGrado}
                            onChange={(newValue) => setFechaGrado(newValue)}
                            format="DD-MM-YYYY"
                            error={!fechaGrado}
                            helperText={'Ingrese la fecha de grado del estudiante.'}
                            fullWidth
                            sx={{ minWidth: '100%' }}
                            components={{
                                openPickerIcon: () => (
                                    <CalendarMonth sx={{ color: '#576a3d', marginRight: '20px' }} />
                                ),
                            }}
                        />
                    </LocalizationProvider>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} disabled={isLoading}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ width: 150 }} disabled={(fechaGrado === estudiante.fecha_grado) || isLoading}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CambiarFecha.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    estudiante: PropTypes.object.isRequired,
};

export default CambiarFecha;
