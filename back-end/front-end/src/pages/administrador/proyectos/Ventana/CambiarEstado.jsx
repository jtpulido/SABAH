import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, CssBaseline, DialogTitle, Dialog, Button, DialogActions, DialogContent, Select, MenuItem, FormControl } from "@mui/material";
import { SaveOutlined } from '@mui/icons-material';
import { selectToken } from '../../../../store/authSlice';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

function CambiarEstado(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { onClose, proyecto, onSubmit, open, ...other } = props;
    const token = useSelector(selectToken);

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const [estado, setEstado] = useState('');
    const [estados, setEstados] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleEntering = () => {
        obtenerEstados()
    };

    useEffect(() => {
        if (estados.length > 0 && proyecto) {
            const estadoInicial = estados.find(estado => estado.id === proyecto.id_estado);
            setEstado(estadoInicial || '');
        }
    }, [estados, proyecto]);

    const handleCancel = () => {
        setEstados([])
        setEstado('')
        onClose();
    };

    const modificarEstado = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${apiBaseUrl}/admin/cambiarEstado`, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ proyecto: proyecto, nuevo_estado: estado })
            });
            const data = await response.json();
            if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (data.success) {
                mostrarMensaje("Se ha actualizado el estado del proyecto.", "success");
                const cambio = {
                    id_estado: estado.id,
                    estado: estado.nombre
                };
                onSubmit(cambio)
                setEstados([])
                setEstado('')
            } else {
                mostrarMensaje(data.message, "error")
            }
        }
        catch (error) {
            mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
        setIsLoading(false);
    };

    const obtenerEstados = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/admin/estados`, {
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

    const handleEstadoChange = (event) => {
        setEstado(event.target.value);
    };

    return (
        <Dialog open={open} onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}  {...other} >
            <CssBaseline />
            <form onSubmit={(e) => modificarEstado(e)}>
                <DialogTitle variant="h1" color="secondary">Cambiar Estado</DialogTitle>
                <DialogContent dividers >
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} disabled={isLoading}>
                        Cerrar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isLoading} startIcon={<SaveOutlined />} sx={{ width: 150 }} >
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CambiarEstado.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    proyecto: PropTypes.object.isRequired,
};

export default CambiarEstado;
