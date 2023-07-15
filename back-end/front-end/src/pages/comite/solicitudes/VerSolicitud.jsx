import React, { useState } from 'react';


import PropTypes from 'prop-types';

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { ExpandMore } from '@mui/icons-material';
import { Typography, Stack, RadioGroup, FormControlLabel, FormControl, Radio, Accordion, AccordionSummary, AccordionDetails, useTheme, CircularProgress, Box, TextField, Grid, CssBaseline, Button, DialogTitle, Dialog, DialogActions, Divider, DialogContent } from "@mui/material";

import CustomDataGrid from "../../layouts/DataGrid";
 import { useSnackbar } from 'notistack';
function VerSolicitud(props) {

    const { onClose, id_solicitud, open } = props;

    const { enqueueSnackbar } = useSnackbar();
  
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useState(true);
    const [isFormValid, setIsFormValid] = useState(false);

    const [comments, setComments] = useState('');
    const [approval, setApproval] = useState('');

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
        setApproval('')
        setComments('')
    };

    const obtenerInfoSolicitud = async (id) => {
        try {
            const response = await fetch("http://localhost:5000/comite/solicitudes/verSolicitud", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id })
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
            const response = await fetch("http://localhost:5000/comite/solicitudes/verAprobaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id })
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
    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/comite/solicitudes/agregarAprobacion", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ aprobado: approval, comentario: comments, id_solicitud })
            });
            const data = await response.json();

            setIsFormValid(false)
            if (response.status === 200) {
                mostrarMensaje("Se ha guardado su respuesta!","success")
                obtenerInfoSolicitud(id_solicitud)
                obtenerAprobacionesSolicitud(id_solicitud)
            } else if (response.status === 502) {
                mostrarMensaje(data.message, "error")
            } else if (response.status === 203 || response.status === 400) {
                mostrarMensaje(data.message, "warning")
            } else {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")

            }
        } catch (error) {
            handleCancel()
            mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error")
        }
        setLoading(false);
    };

    const columns = [
        { field: 'aprobado', headerName: 'Aprobado', flex: 0.1, minWidth: 80,  align: "center" },
        { field: 'aprobador', headerName: 'Aprobador', flex: 0.2, minWidth: 80,  align: "center" },
        { field: 'fecha', headerName: 'Fecha', flex: 0.2, minWidth: 100,  align: "center" },
        { field: 'comentario_aprobacion', headerName: 'Comentario', flex: 0.5, minWidth: 150,  align: "center" }
    ];
    const handleApprovalChange = (event) => {
        setApproval(event.target.value);
        checkFormValidity(event.target.value, comments);
    };

    const handleCommentsChange = (event) => {
        setComments(event.target.value);
        checkFormValidity(approval, event.target.value);
    };

    const checkFormValidity = (approvalValue, commentsValue) => {
        setIsFormValid(approvalValue !== '' && commentsValue !== '');
    };

    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} fullWidth maxWidth='md' onClose={handleCancel}>
           
            <CssBaseline />

            <DialogTitle variant="h1" color={colors.primary[100]}>VER SOLICITUD</DialogTitle>
            <DialogContent dividers  >
                {solicitud == null || loading ? (
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h2" color={colors.secundary[100]}>
                            Información del proyecto
                        </Typography>

                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Código
                                </Typography>
                                <TextField value={solicitud.codigo_proyecto || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Etapa
                                </Typography>
                                <TextField value={solicitud.etapa_proyecto || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Nombre del director
                                </Typography>
                                <TextField multiline value={solicitud.nombre_director || ''} fullWidth />
                            </Grid>
                        </Grid>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Typography variant="h2" color={colors.secundary[100]}>
                            Información de la solicitud
                        </Typography>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Tipo
                                </Typography>
                                <TextField multiline value={solicitud.tipo_solicitud || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Fecha de creación
                                </Typography>
                                <TextField value={solicitud.fecha_solicitud || ''} fullWidth />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={4}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Creada por
                                </Typography>
                                <TextField value={solicitud.creado_por_proyecto ? 'Proyecto' : 'Director del proyecto' || ''} fullWidth />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Justificación
                                </Typography>
                                <TextField fullWidth multiline value={solicitud.justificacion || ''} />

                            </Grid>
                        </Grid>
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        {!solicitud.finalizado ? (

                            <>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore color='secondary' fontSize="large" />}>
                                        <Typography variant="h2" color={colors.secundary[100]}>
                                            Responder solicitud
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FormControl fullWidth>
                                            <Stack spacing={1} >
                                                <Typography variant="h6" color={colors.secundary[100]}>
                                                    Aprobado
                                                </Typography>
                                                <RadioGroup row value={approval} onChange={handleApprovalChange}>
                                                    <FormControlLabel value="false" control={<Radio />} label="No" />
                                                    <FormControlLabel value="true" control={<Radio />} label="Sí" />
                                                </RadioGroup>
                                                <Typography variant="h6" color={colors.secundary[100]}>
                                                    Comentarios
                                                </Typography>
                                                <TextField fullWidth multiline maxRows={5} required placeholder="Agregue comentarios" value={comments} onChange={handleCommentsChange} />
                                                <Button variant="contained" color="primary" disabled={!isFormValid} onClick={handleSave} >
                                                    Guardar
                                                </Button>
                                            </Stack>
                                        </FormControl>

                                    </AccordionDetails>
                                </Accordion>

                            </>
                        ) : (
                            <>
                                <Divider />
                            </>
                        )
                        }
                        <Divider sx={{ mt: 1, mb: 1 }} />
                        <Typography variant="h2" color={colors.secundary[100]}>
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