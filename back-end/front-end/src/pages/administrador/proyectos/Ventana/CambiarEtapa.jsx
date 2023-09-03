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
    Select,
    MenuItem,
    FormControl
} from "@mui/material";
import { CalendarMonth, SaveOutlined } from '@mui/icons-material';
import { selectToken } from '../../../../store/authSlice';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

function CambiarEtapa(props) {
    const { onClose, proyecto, onSubmit, open, ...other } = props;
    const token = useSelector(selectToken);
    const [anio, setAnio] = useState(dayjs());
    const [periodo, setPeriodo] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const [etapa, setEtapa] = useState('');
    const [etapas, setEtapas] = useState([]);

    const handleEntering = async () => {
        await obtenerEtapas();
    };
    useEffect(() => {
        if (etapas.length > 0 && proyecto) {
            const etapaInicial = etapas.find(etapa => etapa.id === proyecto.id_etapa);
            setEtapa(etapaInicial || '');
            setPeriodo(proyecto.periodo)
        }
    }, [etapas, proyecto]);

    const handleCancel = () => {
        setEtapas([]);
        setEtapa('');
        setAnio(dayjs())
        onClose();
    };

    const modificarEtapa = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/admin/cambiarEtapa", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ proyecto: proyecto, nueva_etapa: etapa, anio: anio.year(), periodo })
            });
            const data = await response.json();
            if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (data.success) {
                mostrarMensaje("Se ha actualizado la etapa del proyecto.", "success");
                const cambio = {
                    anio: anio.year(),
                    periodo,
                    id_etapa: etapa.id,
                    etapa: etapa.nombre,
                    id_estado: data.estado.id,
                    estado: data.estado.nombre
                };
                onSubmit(cambio);
                setEtapas([]);
                setEtapa('');
                setAnio(dayjs())
            } else {
                mostrarMensaje(data.message, "error");
            }
        } catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error");
        }
    };

    const obtenerEtapas = async () => {
        try {
            const response = await fetch("http://localhost:5000/admin/etapas", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                setEtapas(data.etapas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
        }
    };

    const handleEtapaChange = (event) => {
        setEtapa(event.target.value);
    };
    const handlePeriodoChange = (event) => {
        setPeriodo(event.target.value);
    };
    const shouldDisableDate = (date) => {
        const currentDate = dayjs();
        const currentYear = currentDate.year();
        const selectedYear = date.year();
        return selectedYear < currentYear;
    };

    return (
        <Dialog open={open} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }} {...other}>
            <CssBaseline />
            <form onSubmit={(e) => modificarEtapa(e)}>
                <DialogTitle variant="h1" color="secondary">Cambiar Etapa</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="h6" color="primary">
                        Etapa
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={etapa}
                            onChange={handleEtapaChange}
                            required
                            fullWidth
                        >
                            {etapas.map((etapa) => (
                                <MenuItem key={etapa.id} value={etapa}>
                                    {etapa.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="h6" color="primary">
                        Año
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            openTo="year"
                            views={['year']}
                            required
                            value={anio}
                            onChange={(newValue) => setAnio(newValue)}
                            format="YYYY"
                            error={!anio}
                            helperText={'Ingrese el año.'}
                            fullWidth
                            sx={{ minWidth: '100%' }}
                            shouldDisableDate={shouldDisableDate}
                            components={{
                                openPickerIcon: () => (
                                    <CalendarMonth sx={{ color: '#576a3d', marginRight: '20px' }} />
                                ),
                            }}
                        />
                    </LocalizationProvider>
                    <FormControl fullWidth variant="outlined" style={{ marginBottom: '8px' }}>
                        <Typography variant="h6" color="primary">
                            Periodo
                        </Typography>
                        <Select
                            required
                            value={periodo}
                            onChange={handlePeriodoChange}
                        >
                            <MenuItem value="01">01</MenuItem>
                            <MenuItem value="02">02</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" disabled={proyecto.anio === anio && proyecto.periodo === periodo} startIcon={<SaveOutlined />} sx={{ width: 150 }}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CambiarEtapa.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    proyecto: PropTypes.object.isRequired,
};

export default CambiarEtapa;
