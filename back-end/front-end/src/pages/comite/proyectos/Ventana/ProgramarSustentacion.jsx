import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, DialogTitle, Dialog, Button, DialogActions, DialogContent, TextField } from "@mui/material";
import { CalendarMonth, SaveOutlined } from '@mui/icons-material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import { useSnackbar } from 'notistack';
import { DateTimePicker } from '@mui/x-date-pickers';

function ProgramarSustentacion(props) {

    const { onClose, sustentacion, onSubmit, open, ...other } = props;
    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const [lugarSustentacion, setLugarSustentacion] = useState('');

    const [fechaSustentacion, setFechaSustentacion] = useState('');

    const handleEntering = () => {
        setFechaSustentacion(sustentacion.fecha_sustentacion)
    };

    const handleCancel = () => {
        onClose();
        setFechaSustentacion('')
        setLugarSustentacion('')
    };

    const modificarFechaSustentacion = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/comite/programarSustentacion", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id: sustentacion.id_proyecto, anio: sustentacion.anio, periodo: sustentacion.periodo, lugar: lugarSustentacion, fecha: fechaSustentacion })
            });
            const data = await response.json();
            if (data.success) {
                onSubmit(data.sustentacion)
                mostrarMensaje("Se ha actualizado la fecha de grado", "success");
                setFechaSustentacion('')
                setLugarSustentacion('')
            } else {
                mostrarMensaje(data.message, "error")
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
    };
    const handleLugarChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setLugarSustentacion(isOnlyWhitespace ? "" : value);
    };

    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} onClose={handleCancel} {...other} >
            <form onSubmit={(e) => modificarFechaSustentacion(e)}>
                <DialogTitle variant="h1" color="secondary">Programar Sustentación</DialogTitle>
                <DialogContent dividers >

                    <Typography variant="h6" color="primary">
                        Fecha
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            required
                            value={fechaSustentacion}
                            onChange={(newValue) => setFechaSustentacion(newValue)}
                            format="DD/MM/YYYY hh:mm A"
                            error={!fechaSustentacion}
                            helperText={'Ingrese la fecha de sustentación'}
                            fullWidth
                            sx={{ minWidth: '100%' }}
                            components={{
                                openPickerIcon: () => (
                                    <CalendarMonth sx={{ color: '#576a3d', marginRight: '20px' }} />
                                ),
                            }}
                        />
                    </LocalizationProvider>
                    <Typography variant="h6" color="primary">
                        Lugar
                    </Typography>
                    <TextField
                        autoFocus
                        value={lugarSustentacion}
                        onChange={(e) => handleLugarChange(e.target.value)}
                        fullWidth error={!lugarSustentacion}
                        helperText={'Ingresa el lugar de la sustentación'}
                        multiline
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ width: 150 }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

ProgramarSustentacion.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    sustentacion: PropTypes.object.isRequired,
};

export default ProgramarSustentacion;
