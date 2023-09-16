import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import {
    Typography,     CircularProgress, Box, TextField, Grid, CssBaseline, 
    Button, DialogTitle, Dialog, DialogActions, Divider, DialogContent
} from "@mui/material";

import CustomDataGrid from "../../layouts/DataGrid";
import { useSnackbar } from 'notistack';

function VerSolicitud(props) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { onClose, id_solicitud, open } = props;

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const token = useSelector(selectToken);

    const [loading, setLoading] = useState(true);
    const [solicitud, setSolicitud] = useState(null);

    const [aprobaciones, setAprobaciones] = useState([]);

    const handleEntering = () => {
        obtenerInfoSolicitud(id_solicitud)
        obtenerAprobacionesSolicitud(id_solicitud)
        setLoading(false);
    };

    const handleCancel = () => {
        onClose();
        setSolicitud(null)
        setAprobaciones([])
        setLoading(true)
    };

    const obtenerInfoSolicitud = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/solicitudes/verSolicitud/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setSolicitud(data.solicitud)
            } else if (response.status === 502) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            }
        } catch (error) {
            setLoading(true)
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
    const obtenerAprobacionesSolicitud = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/solicitudes/verAprobaciones/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setAprobaciones(data.aprobaciones)
            } else if (response.status === 502) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning")
            }
        } catch (error) {
            setLoading(true)
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
    };
   

    const columns = [
        { field: 'aprobado', headerName: 'Aprobado', flex: 0.1, minWidth: 80, align: "center" },
        { field: 'aprobador', headerName: 'Aprobador', flex: 0.2, minWidth: 80, align: "center" },
        { field: 'fecha', headerName: 'Fecha', flex: 0.2, minWidth: 100, align: "center" },
        { field: 'comentario_aprobacion', headerName: 'Comentario', flex: 0.5, minWidth: 150, align: "center" }
    ];
  

    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} fullWidth maxWidth='md' onClose={handleCancel}>

            <CssBaseline />

            <DialogTitle variant="h1" color="primary">VER SOLICITUD</DialogTitle>
            <DialogContent dividers  >
                {solicitud == null || loading ? (
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h2" color="secondary">
                            Información del proyecto
                        </Typography>

                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Código
                                </Typography>
                                <TextField value={solicitud.codigo_proyecto || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Etapa
                                </Typography>
                                <TextField value={solicitud.etapa_proyecto || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Nombre del director
                                </Typography>
                                <TextField multiline value={solicitud.nombre_director || ''} fullWidth />
                            </Grid>
                        </Grid>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Typography variant="h2" color="secondary">
                            Información de la solicitud
                        </Typography>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Tipo
                                </Typography>
                                <TextField multiline value={solicitud.tipo_solicitud || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Fecha de creación
                                </Typography>
                                <TextField value={solicitud.fecha_solicitud || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color="primary">
                                    Creada por
                                </Typography>
                                <TextField value={solicitud.creado_por_proyecto ? 'Proyecto' : 'Director del proyecto' || ''} fullWidth />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Typography variant="h6" color="primary">
                                    Justificación
                                </Typography>
                                <TextField fullWidth multiline value={solicitud.justificacion || ''} />

                            </Grid>
                        </Grid>                        
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Typography variant="h2" color="secondary">
                            Aprobaciones
                        </Typography>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <CustomDataGrid rows={aprobaciones} columns={columns} mensaje="No hay aprobaciones" />


                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>
                    Cerrar
                </Button>
            </DialogActions>

        </Dialog>
    )
}
VerSolicitud.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default VerSolicitud;