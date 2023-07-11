import React, { useState, useEffect } from 'react';


import PropTypes from 'prop-types';

import { tokens } from "../../../../theme";
import { useSelector } from "react-redux";
import { selectToken } from "../../../../store/authSlice";
import { ExpandMore } from '@mui/icons-material';
import { Typography, Stack, RadioGroup, TextareaAutosize, FormControlLabel, FormControl, Radio, Accordion, AccordionSummary, AccordionDetails, useTheme, CircularProgress, Box, TextField, Grid, CssBaseline, Button, DialogTitle, Dialog, DialogActions, Divider, DialogContent } from "@mui/material";

import CustomDataGrid from "../../../layouts/DataGrid";

import { useSnackbar } from 'notistack';

function CalificarEntrega(props) {

    const { onClose, entrega, open } = props;

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
    const [docEntregado, setDocEntregado] = useState(null);

    const handleEntering = () => {
        infoDocEntrega(entrega.id);
        obtenerAspectos(entrega.id_espacio_entrega)
        setLoading(false);
    };

    const handleCancel = () => {
        onClose();
        setPuntaje({})
        setComentario({})
        setAspectos([])
        setLoading(true)
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

    const infoDocEntrega = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/documento/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setDocEntregado(data.documento)
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
    const obtenerAspectos = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/comite/documento/aspectos/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.status === 200) {
                setAspectos(data.aspectos)
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

    const guardarCalificacion = async (event) => {
        setLoading(true);
        event.preventDefault();
        try {

            const calificacionData = {
                id_doc_entrega: entrega.id,
                calificacion_aspecto: aspectos.map((aspecto) => ({
                    id_rubrica_aspecto: aspecto.id_rubrica_aspecto,
                    puntaje: puntaje[aspecto.id_aspecto] || 0,
                    comentario: comentario[aspecto.id_aspecto] || ""
                })),
            };

            const response = await fetch("http://localhost:5000/comite/documento/guardarCalificacion", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(calificacionData)
            });
            const data = await response.json();
            if (response.status === 200) {
                mostrarMensaje("Se ha guardado su respuesta!", "success")
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
    return (
        <Dialog open={open} TransitionProps={{ onEntering: handleEntering }} fullWidth maxWidth='md' onClose={handleCancel}>
            <CssBaseline />
            <form onSubmit={guardarCalificacion}>
                <DialogTitle variant="h1" color={colors.primary[100]}>CALIFICAR ENTREGA</DialogTitle>
                <DialogContent dividers  >
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {aspectos.map((aspecto) => (
                                <div key={aspecto.id_aspecto}>
                                    <TextField
                                        label={aspecto.aspecto_nombre}
                                        type="number"
                                        value={puntaje[aspecto.id_aspecto] || ""}
                                        onChange={(e) => handlePuntajeChange(aspecto.id_aspecto, e.target.value)}
                                        inputProps={{
                                            min: 0,
                                            max: aspecto.aspecto_puntaje,
                                        }}
                                        required
                                        error={
                                            puntaje[aspecto.id_aspecto] > aspecto.aspecto_puntaje ||
                                            puntaje[aspecto.id_aspecto] < 0
                                        }
                                        
                                        helperText={`Valor debe estar entre 0 y ${aspecto.aspecto_puntaje}`}
                                        fullWidth
                                    />
                                    <TextareaAutosize
                                        placeholder="Comentario"
                                        value={comentario[aspecto.id_aspecto] || ""}
                                        onChange={(e) => handleComentarioChange(aspecto.id_aspecto, e.target.value)}
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
            </form>
        </Dialog>
    )
}
CalificarEntrega.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

export default CalificarEntrega;