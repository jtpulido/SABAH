import React, { useState, useEffect } from 'react';


import PropTypes from 'prop-types';

import { tokens } from "../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../store/authSlice";
import { ExpandMore } from '@mui/icons-material';
import { Typography, Stack, RadioGroup, TextareaAutosize, FormControlLabel, FormControl, Radio, Accordion, AccordionSummary, AccordionDetails, useTheme, CircularProgress, Box, TextField, Grid, CssBaseline, Button, DialogTitle, Dialog, DialogActions, Divider, DialogContent } from "@mui/material";

import CustomDataGrid from "../../layouts/DataGrid";

import { useSnackbar } from 'notistack';

function CalificarEntrega(props) {

    const { onClose, id_solicitud, open } = props;

    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const token = useSelector(selectToken);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useState(true);

    const [puntaje, setPuntaje] = useState({});
    const [comentario, setComentario] = useState({});
    const [aspectos, setAspectos] = useState([]);
    const [entrega, setEntrega] = useState(null);
    const [espacio, setEspacio] = useState(null);

    const handleEntering = () => {
        obtenerInfoSolicitud(id_solicitud)
        obtenerAprobacionesSolicitud(id_solicitud)
        setLoading(false);
    };

    const handleCancel = () => {
        onClose();
        setPuntaje({})
        setComentario({})
        setAspectos([])
        setLoading(true)
        setApproval('')
        setComments('')
    };
    const handlePuntajeChange = (aspectoId, value) => {
        setPuntaje((prevPuntaje) => ({
            ...prevPuntaje,
            [aspectoId]: value,
        }));
    };

    const handleComentarioChange = (aspectoId, value) => {
        setComentario((prevComentario) => ({
            ...prevComentario,
            [aspectoId]: value,
        }));
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
        event.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/comite/solicitudes/agregarAprobacion", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ aprobado: approval, comentario: comments, id_solicitud })
            });
            const data = await response.json();
            if (response.status === 200) {
                mostrarMensaje("Se ha guardado su respuesta!", "success")
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
        { field: 'aprobado', headerName: 'Aprobado', flex: 0.1, minWidth: 80, align: "center" },
        { field: 'aprobador', headerName: 'Aprobador', flex: 0.2, minWidth: 80, align: "center" },
        { field: 'fecha', headerName: 'Fecha', flex: 0.2, minWidth: 100, align: "center" },
        { field: 'comentario_aprobacion', headerName: 'Comentario', flex: 0.5, minWidth: 150, align: "center" }
    ];


    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} fullWidth maxWidth='md' onClose={handleCancel}>
            <CssBaseline />
            <form onSubmit={handleSave}>
            <DialogTitle variant="h1" color={colors.primary[100]}>CALIFICAR ENTREGA</DialogTitle>
            <DialogContent dividers  >
                {espacio === null ||entrega === null || aspectos===null || loading ? (
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {aspectos.map((aspecto) => (
                            <div key={aspecto.id}>
                                <TextField
                                    label={aspecto.nombre}
                                    type="number"
                                    value={puntaje[aspecto.id] || ''}
                                    onChange={(e) => handlePuntajeChange(aspecto.id, e.target.value)}
                                    required
                                />
                                <TextareaAutosize
                                    placeholder="Comentario"
                                    value={comentario[aspecto.id] || ''}
                                    onChange={(e) => handleComentarioChange(aspecto.id, e.target.value)}
                                    rows={4}
                                    minRows={4}
                                    required
                                />
                            </div>
                        ))}

                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>
                    Cerrar
                </Button>
                <Button variant="contained" type="submit">
                    Guardar calificación
                </Button>
            </DialogActions>
<</form>
        </Dialog>
    )
}
VerSolicitud.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default VerSolicitud;