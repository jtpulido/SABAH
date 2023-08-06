import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    Typography,
    CircularProgress,
    Box,
    TextField,
    CssBaseline,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { ExpandMore } from '@mui/icons-material';
import CustomDataGrid from '../../../layouts/DataGrid';

function VerEntrega({ open, onClose, entrega = {}, tipo }) {

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const token = useSelector(selectToken);

    const [loading, setLoading] = useState(true);
    const [aspectosCalificados, setAspectosCalificados] = useState([]);
    const [docEntregado, setDocEntregado] = useState(null);
    const [titulo, setTitulo] = useState("");
    const handleEntering = async () => {
        setTitulo(
                tipo === "calificado" ? "Ver Entrega y Calificación" :
                    "Ver Entrega"
        );
        if (tipo !== "pendiente") {
            await infoDocEntrega(entrega.id);
        }
        if (tipo === "calificado") {
            await obtenerCalificacionAspectos(entrega.id);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        onClose();
        setLoading(true);
    };


    const infoDocEntrega = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/documento/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                setDocEntregado(data.documento);
            } else if (response.status === 502) {
                mostrarMensaje(data.message, 'error');
            } else if (response.status === 203) {
                mostrarMensaje(data.message, 'warning');
            }
        } catch (error) {
            mostrarMensaje(
                'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.',
                'error'
            );
        }
    };


    const obtenerCalificacionAspectos = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/calificacion/aspectos/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                setAspectosCalificados(data.aspectos);
            } else if (response.status === 502) {
                mostrarMensaje(data.message, 'error');
            } else if (response.status === 203) {
                mostrarMensaje(data.message, 'warning');
            }
        } catch (error) {
            setLoading(true);
            mostrarMensaje(
                'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.',
                'error'
            );
        }
    };

    const columnas = [
        { field: 'nombre_aspecto', headerName: 'Aspecto', flex: 0.3, minWidth: 200 },
        { field: 'puntaje_aspecto', headerName: 'Puntaje', flex: 0.1, minWidth: 100 },
        { field: 'comentario_aspecto', headerName: 'Comentario', flex: 0.3, minWidth: 150 },
    ]
    const formatFecha = (fecha) => {
        if (!fecha || !dayjs(fecha).isValid()) {
            return 'Fecha inválida';
        }
        return dayjs(fecha).format('DD-MM-YYYY HH:mm:ss');
    };
    return (
        <Dialog open={open} fullWidth maxWidth="md" onClose={handleCancel} TransitionProps={{ onEntering: handleEntering }}>
            <CssBaseline />

            <DialogTitle variant="h1" color="primary">
                {titulo}
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h2" color="secondary">
                            Información general de la entrega
                        </Typography>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" color="primary">
                                    Nombre de la entrega
                                </Typography>
                                <TextField value={entrega.nombre_espacio_entrega} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" color="primary">
                                    Evaluador
                                </Typography>
                                <TextField value={entrega.nombre_rol} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" color="primary">
                                    Fecha de apertura
                                </Typography>
                                <TextField value={formatFecha(entrega.fecha_apertura)} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6" color="primary">
                                    Fecha de cierre
                                </Typography>
                                <TextField value={formatFecha(entrega.fecha_cierre)} fullWidth />
                            </Grid>

                        </Grid>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Typography variant="h2" color="secondary">
                            Información de la entrega del proyecto
                        </Typography>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Grid container spacing={2}>

                            <Grid item xs={12} sm={6} >
                                <Typography variant="h6" color="primary">
                                    Nombre del proyecto
                                </Typography>
                                <TextField value={entrega.nombre_proyecto} multiline fullWidth />
                            </Grid>
                            {tipo !== "pendiente" && (
                                <>
                                    <Grid item xs={12} sm={6} >
                                        <Typography variant="h6" color="primary">
                                            Evaluador
                                        </Typography>
                                        <TextField value={entrega.evaluador} fullWidth />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={4} lg={4}>
                                        <Typography variant="h6" color="primary">
                                            Fecha de entrega
                                        </Typography>
                                        <TextField value={formatFecha(entrega.fecha_entrega)} fullWidth />
                                    </Grid>
                                    {tipo === "calificado" && (
                                        <>
                                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                                <Typography variant="h6" color="primary">
                                                    Fecha de calificación
                                                </Typography>
                                                <TextField value={formatFecha(entrega.fecha_evaluacion)} fullWidth />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                                <Typography variant="h6" color="primary">
                                                    Nota
                                                </Typography>
                                                <TextField value={entrega.nota_final} fullWidth />
                                            </Grid>
                                        </>
                                    )}
                                </>
                            )}
                        </Grid>

                        {tipo === "calificado" && (
                            <Accordion sx={{ mt: 1, mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMore color='secondary' fontSize="large" />}>
                                    <Typography variant="h2" color="secondary">
                                        Ver calificación por aspecto
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <CustomDataGrid rows={aspectosCalificados} columns={columnas} mensaje="No se encontraron las calificaciones." />
                                </AccordionDetails>
                            </Accordion>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cerrar</Button>
            </DialogActions>


        </Dialog >
    )
}

VerEntrega.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    entrega: PropTypes.object.isRequired,
    tipo: PropTypes.string.isRequired
};

export default VerEntrega;
