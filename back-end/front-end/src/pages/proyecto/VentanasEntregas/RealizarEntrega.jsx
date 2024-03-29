import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, CssBaseline, Grid,
    TextField, Typography, Divider,Box,CircularProgress
} from '@mui/material';


import { useSnackbar } from 'notistack';
import { SaveOutlined } from '@mui/icons-material';
import { selectToken } from '../../../store/authSlice';

function RealizarEntrega({ open, onClose, onSubmit, entrega }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const token = useSelector(selectToken);

    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleInputChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('entrega', JSON.stringify(entrega));
                formData.append('nombreArchivo', JSON.stringify(selectedFile.name));

                const response = await fetch(`${apiBaseUrl}/entrega/guardar`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                if (!data.success) {
                    mostrarMensaje(data.message, "error");
                } else if (response.status === 203) {
                    mostrarMensaje(data.message, "warning");
                } else if (response.status === 200) {
                    onSubmit()
                    mostrarMensaje(data.message, "success")
                }
            } catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
            }
        }
        setLoading(false)
    };

    const formatFecha = (fecha) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(fecha).toLocaleString(undefined, options);
    };

    return (
        <Dialog open={open} fullWidth maxWidth='md' onClose={onClose}>

            <CssBaseline />
            <form onSubmit={handleSubmit}>
                <DialogTitle variant="h1" color="primary">Entrega de Documento</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="h2" color="secondary">
                        Información general de la entrega
                    </Typography>

                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color="primary">
                                Nombre
                            </Typography>
                            <TextField value={entrega.nombre_espacio_entrega || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color="primary">
                                Descripción
                            </Typography>
                            <TextField value={entrega.descripcion || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color="primary">
                                Evaluador
                            </Typography>
                            <TextField multiline value={entrega.nombre_rol || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color="primary">
                                Etapa
                            </Typography>
                            <TextField value={entrega.etapa} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color="primary">
                                Año
                            </Typography>
                            <TextField value={entrega.anio} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color="primary">
                                Periodo
                            </Typography>
                            <TextField value={entrega.periodo} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de apertura entrega
                            </Typography>
                            <TextField value={formatFecha(entrega.fecha_apertura_entrega)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de cierre entrega
                            </Typography>
                            <TextField value={formatFecha(entrega.fecha_cierre_entrega)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de apertura calificación
                            </Typography>
                            <TextField value={formatFecha(entrega.fecha_apertura_calificacion)} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" color="primary">
                                Fecha de cierre calificación
                            </Typography>
                            <TextField value={formatFecha(entrega.fecha_cierre_calificacion)} fullWidth />
                        </Grid>
                    </Grid>

                    <Divider sx={{ mt: 2, mb: 2 }} />
                    <Typography variant="h2" color="secondary">
                        Agregar entrega
                    </Typography>

                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        Documento
                    </Typography>
                    <TextField fullWidth required placeholder="Agregue el documento" type='file' onChange={handleInputChange} />

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{
                        width: 150,
                    }}>
                        Guardar
                    </Button>
                    </>
                    )}
                </DialogActions>
            </form>
        </Dialog>
    );
};
RealizarEntrega.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    entrega: PropTypes.object.isRequired,
};

export default RealizarEntrega;
