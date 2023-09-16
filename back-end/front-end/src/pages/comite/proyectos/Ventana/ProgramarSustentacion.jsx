import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, DialogTitle, Dialog, Button, DialogActions, DialogContent, TextField, MenuItem, FormControl, Select, Box } from "@mui/material";
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
    const [newSustentacion, setNewSustentacion] = useState({});
    const [existeProyecto, setExisteProyecto] = useState(true);
    const [proyecto, setProyecto] = useState('');
    const [proyectos, setProyectos] = useState([]);
    const [lugarSustentacion, setLugarSustentacion] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [fechaSustentacion, setFechaSustentacion] = useState('');

    const handleEntering = () => {
        if (Object.keys(sustentacion).length === 0) {
            setExisteProyecto(false)
            obtenerProyectosSustentacion()
        } else {
            setProyecto((prevState) => ({
                ...prevState,
                id: sustentacion.id_proyecto,
                anio: sustentacion.anio,
                periodo: sustentacion.periodo
            }));
        }
    };

    const handleCancel = () => {
        onClose();
        setFechaSustentacion('')
        setLugarSustentacion('')
        setProyecto('')
        setProyectos([])
        setNewSustentacion({})
    };

    const obtenerProyectosSustentacion = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/sustentacion/proyectos", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "info");
            } else if (response.status === 200) {
                setProyectos(data.proyectos);
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
    };
    useEffect(() => {
        setNewSustentacion((prevState) => ({
            ...prevState,
            id_proyecto: proyecto.id,
            anio: proyecto.anio,
            periodo: proyecto.periodo
        }));
    }, [proyecto]);

    const programarSustentacion = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (
            newSustentacion.id_proyecto &&
            newSustentacion.anio &&
            newSustentacion.periodo &&
            lugarSustentacion &&
            fechaSustentacion
        ) {
            try {
                const response = await fetch("http://localhost:5000/comite/programarSustentacion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        id: newSustentacion.id_proyecto,
                        anio: newSustentacion.anio,
                        periodo: newSustentacion.periodo,
                        lugar: lugarSustentacion,
                        fecha: fechaSustentacion.format("DD/MM/YYYY hh:mm A")
                    })
                });
                const data = await response.json();
                if (data.success) {
                    onSubmit(data.sustentacion);
                    mostrarMensaje("Se ha programado la fecha y lugar de sustentación.", "success");
                    setFechaSustentacion('');
                    setLugarSustentacion('');
                    setProyecto('');
                    setProyectos([]);
                    setNewSustentacion({});
                } else {
                    mostrarMensaje(data.message, "error");
                }
            } catch (error) {
                mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error");
            }
        } else {
            mostrarMensaje("Intentalo de nuevo.", "info");
        }
        setIsLoading(false);
    };
    const handleLugarChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setLugarSustentacion(isOnlyWhitespace ? "" : value);
    };

    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} onClose={handleCancel} {...other} >
            <form onSubmit={(e) => programarSustentacion(e)}>
                <DialogTitle variant="h1" color="secondary">Programar Sustentación</DialogTitle>
                <DialogContent dividers >
                    {!existeProyecto && proyectos.length > 0 ? (
                        <FormControl fullWidth margin="normal">
                            <Typography variant="h6" color="primary">
                                Proyectos
                            </Typography>
                            <Select
                                value={proyecto}
                                onChange={(event) => setProyecto(event.target.value)}
                                required
                                fullWidth
                            >
                                {proyectos.map((proyecto) => (
                                    <MenuItem key={proyecto.id} value={proyecto}>
                                        {proyecto.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (null)}
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
                    <Button onClick={handleCancel} disabled={isLoading}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isLoading} startIcon={<SaveOutlined />} sx={{ width: 150 }}>
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
