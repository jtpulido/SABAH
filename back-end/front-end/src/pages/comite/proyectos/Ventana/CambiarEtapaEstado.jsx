import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, CssBaseline, DialogTitle, Dialog, Button, DialogActions, DialogContent, Grid, Select, MenuItem, FormControl } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { selectToken } from '../../../../store/authSlice';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

function CambiarEtapaEstado(props) {

    const { onClose, proyecto, onSubmit, open, ...other } = props;
    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const [etapa, setEtapa] = useState('');
    const [estado, setEstado] = useState('');
    const [etapas, setEtapas] = useState([]);
    const [estados, setEstados] = useState([]);

    const handleEntering = () => {
        obtenerEstados()
        obtenerEtapas()
    };
    useEffect(() => {
        if (etapas.length > 0 && estados.length > 0 && proyecto) {
            const etapaInicial = etapas.find(etapa => etapa.id === proyecto.id_etapa);
            const estadoInicial = estados.find(estado => estado.id === proyecto.id_estado);
            setEtapa(etapaInicial || '');
            setEstado(estadoInicial || '');
        }
    }, [etapas, estados, proyecto]);

    const handleCancel = () => {
        setEtapas([])
        setEstados([])
        setEstado('')
        setEtapa('')
        onClose();
    };

    const modificarEtapaEstado = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/comite/cambiarEtaEsta", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ proyecto: proyecto, nueva_etapa: etapa, nuevo_estado: estado })
            });
            const data = await response.json();
            if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (data.success) {
                mostrarMensaje("Se ha actualizado la etapa y/o el estado del proyecto.", "success");
                const cambio = {
                    id_etapa: etapa.id,
                    etapa: etapa.nombre,
                    id_estado: estado.id,
                    estado: estado.nombre
                };
                onSubmit(cambio)
                setEtapas([])
                setEstados([])
                setEstado('')
                setEtapa('')
            } else {
                mostrarMensaje(data.message, "error")
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
    };

    const obtenerEtapas = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/etapas", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setEtapas(data.etapas);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const obtenerEstados = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/estados", {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            } else if (response.status === 200) {
                setEstados(data.estados);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };

    const handleEtapaChange = (event) => {
        setEtapa(event.target.value);
    };
    const handleEstadoChange = (event) => {
        setEstado(event.target.value);
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}  {...other} >
            <CssBaseline />
            <form onSubmit={(e) => modificarEtapaEstado(e)}>
                <DialogTitle variant="h1" color="secondary">Cambiar Etapa y Estado</DialogTitle>
                <DialogContent dividers >

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Estado
                            </Typography>
                            <FormControl fullWidth>
                                <Select
                                    value={estado}
                                    onChange={handleEstadoChange}
                                    required
                                    fullWidth
                                >
                                    {estados.map((estado) => (
                                        <MenuItem key={estado.id} value={estado}>
                                            {estado.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ width: 150 }} >
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CambiarEtapaEstado.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    proyecto: PropTypes.object.isRequired,
};

export default CambiarEtapaEstado;
