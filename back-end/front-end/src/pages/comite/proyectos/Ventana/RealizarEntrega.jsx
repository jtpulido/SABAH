import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { tokens } from "../../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, CssBaseline, Grid,
    TextField, useTheme, Typography, Divider
} from '@mui/material';


import { useSnackbar } from 'notistack';

function RealizarEntrega({ open, onClose, onSubmit, entrega }) {

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const token = useSelector(selectToken);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleInputChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedFile) {
            try {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('entrega', JSON.stringify(entrega));

                const response = await fetch("http://localhost:5000/comite/guardar", {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                if (response.ok) {
                    mostrarMensaje(data.message, "success")
                    onSubmit()
                } else {
                    mostrarMensaje(data.message, "error")
                }
            } catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
            }
        }
    };

    const formatFecha = (fecha) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(fecha).toLocaleString(undefined, options);
    };

    return (
        <Dialog open={open} fullWidth maxWidth='md' onClose={onClose}>

            <CssBaseline />
            <form onSubmit={handleSubmit}>
                <DialogTitle variant="h1" color={colors.primary[100]}>Entrega de Documento</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="h2" color={colors.secundary[100]}>
                        Información del proyecto
                    </Typography>

                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Nombre
                            </Typography>
                            <TextField value={entrega.nombre || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Descripción
                            </Typography>
                            <TextField value={entrega.descripcion || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Evaluador
                            </Typography>
                            <TextField multiline value={entrega.nombre_rol || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Fecha de apertura
                            </Typography>
                            <TextField multiline value={formatFecha(entrega.fecha_apertura) || ''} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Fecha de cierre
                            </Typography>
                            <TextField multiline value={formatFecha(entrega.fecha_cierre) || ''} fullWidth />
                        </Grid>
                    </Grid>

                    <Divider sx={{ mt: 2, mb: 2 }} />
                    <Typography variant="h2" color={colors.secundary[100]}>
                        Agregar entrega
                    </Typography>

                    <Typography variant="h6" color={colors.secundary[100]}>
                        Documento
                    </Typography>
                    <TextField fullWidth required placeholder="Agregue el documento" type='file' onChange={handleInputChange} />

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Entregar
                    </Button>
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
