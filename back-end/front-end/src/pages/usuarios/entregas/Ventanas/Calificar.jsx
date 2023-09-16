import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    Typography,
    Stack,
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
    DialogContentText,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { Download, DownloadTwoTone, ExpandMore, SaveOutlined } from '@mui/icons-material';
import CustomDataGrid from '../../../layouts/DataGrid';

function CalificarEntrega({ open, onClose, onSubmit, entrega = {}, tipo }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const { enqueueSnackbar } = useSnackbar();

    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };
    const token = useSelector(selectToken);

    const [loading, setLoading] = useState(true);
    const [puntaje, setPuntaje] = useState({});
    const [comentario, setComentario] = useState({});
    const [aspectos, setAspectos] = useState([]);
    const [aspectosCalificados, setAspectosCalificados] = useState([]);
    const [docEntregado, setDocEntregado] = useState(null);
    const [linkDocEntregado, setLinkDocEntregado] = useState(null);
    const [docRetroalimentacion, setDocRetroalimentacion] = useState(null);
    const [linkDocRetro, setLinkDocRetro] = useState(null);
    const [existeDocRetroalimentacion, setExisteDocRetroalimentacion] = useState(false);
    const [titulo, setTitulo] = useState("");

    const handleEntering = async () => {
        console.log(entrega)
        setTitulo(
            tipo === "pendiente" ? "Ver Entrega" :
                tipo === "calificar" ? "Ver/Calificar Entrega" :
                    "Ver Entrega y Calificación"
        );
        if (tipo !== "pendiente") {
            await infoDocEntrega(entrega.id_doc_entrega);
        }
        if (tipo === "calificar") {
            await obtenerAspectos(entrega.id_espacio_entrega);
        }
        if (tipo === "calificado") {
            await obtenerCalificacionAspectos(entrega.id);
            await validarDocumentoRetroalimentacion(entrega.id)
        }
        setLoading(false);
    };

    const handleCancel = () => {
        onClose();
        setPuntaje({});
        setComentario({});
        setAspectos([]);
        setLoading(true);
    };
    const [selectedFile, setSelectedFile] = useState(null);

    const handleInputChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    const handlePuntajeChange = (aspectoId, value) => {
        setPuntaje((prevPuntaje) => ({
            ...prevPuntaje,
            [aspectoId]: value,
        }));
    };

    const handleComentarioChange = (aspectoId, value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setComentario((prevComentario) => ({
            ...prevComentario,
            [aspectoId]: isOnlyWhitespace ? '' : value,
        }));
    };

    const infoDocEntrega = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/documento/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                setLinkDocEntregado(data.nombreArchivo)
                setDocEntregado(data.documento);
            } else if (response.status === 502) {
                mostrarMensaje(data.message, 'error');
            } else if (response.status === 203) {
                setDocEntregado(data.documento);
                mostrarMensaje(data.message, 'warning');
            }
        } catch (error) {
            mostrarMensaje(
                'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.',
                'error'
            );
        }
    };

    const obtenerAspectos = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/documento/aspectos/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                setAspectos(data.aspectos);
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
    const obtenerCalificacionAspectos = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/calificacion/aspectos/${id}`, {
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
    const validarDocumentoRetroalimentacion = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/comite/retroalimentacion/documento/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                setExisteDocRetroalimentacion(true)
                setLinkDocRetro(data.nombreArchivo)
                setDocRetroalimentacion(data.documento);
            } else if (response.status === 502) {
                mostrarMensaje(data.message, 'error');
            } else if (response.status === 203) {
                setExisteDocRetroalimentacion(false)
            }
        } catch (error) {
            setLoading(true);
            mostrarMensaje(
                'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.',
                'error'
            );
        }
    };
    const validarEntregasPendientes = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/verificar-calificaciones-pendientes/${entrega.id_proyecto}/${entrega.id_etapa}/${entrega.anio_proyecto}/${entrega.periodo_proyecto}/${entrega.id_modalidad}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 502) {
                mostrarMensaje(data.message, 'error');
            }
            return data.pendientes
        } catch (error) {
            setLoading(true);
            mostrarMensaje('Lo siento, ha ocurrido un error.', 'error');
        }
    };
    const validarAproboEtapa = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/verificar-calificaciones/${entrega.id_proyecto}/${entrega.id_etapa}/${entrega.anio_proyecto}/${entrega.periodo_proyecto}/${entrega.id_modalidad}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.status === 200) {
                return data.aprobo
            }
            mostrarMensaje(data.message, 'error');
            return false
        } catch (error) {
            setLoading(true);
            mostrarMensaje('Lo siento, ha ocurrido un error.', 'error');
        }
    };
    const asignarCodigo = async (id, acronimo, anio, periodo) => {
        
        try {
          const response = await fetch(`${apiBaseUrl}/comite/asignarCodigo`, {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id: id, acronimo: acronimo, anio: anio, periodo: periodo })
          });
          const data = await response.json();
          if (!data.success) {
            mostrarMensaje(data.message, "error")
          } else {
            mostrarMensaje(`Se ha asignado el código ${data.codigo} al proyecto`, "success");
          }
        } catch (error) {
          mostrarMensaje("Lo sentimos, ha habido un error en la comunicación con el servidor. Por favor, intenta de nuevo más tarde.", "error")
        }
     
      }
    const validarCambioEstado = async () => {
        try {
            const pendientes = await validarEntregasPendientes();
            if (pendientes === false) {
                const aprobo = await validarAproboEtapa();
                if (aprobo === true) {
                    try {
                        const proyecto = {
                            id: entrega.id_proyecto,
                            id_etapa: entrega.id_etapa,
                            id_modalidad: entrega.id_modalidad,
                            nombre: entrega.nombre_proyecto
                        };

                        const response = await fetch(`${apiBaseUrl}/verificar-calificaciones/cambiar-estado`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ proyecto })
                        });
                        const data = await response.json();
                        if (!data.success) {
                            mostrarMensaje(data.message, "error");
                        } else {
                            mostrarMensaje(data.message, "success")
                            if (data.estado === "Aprobado propuesta" && data.etapa === "Propuesta") {
                                asignarCodigo(entrega.id_proyecto, entrega.acronimo, entrega.anio, entrega.periodo)
                            }
                            if (data.estado === "Aprobado" && data.etapa === "Proyecto de grado 2") {
                                const postulado = {
                                    id: entrega.id_proyecto,
                                    id_modalidad: entrega.id_modalidad,
                                    anio: entrega.anio,
                                    periodo: entrega.periodo
                                  };
                                onSubmit(postulado);
                            }
                        }
                    } catch (error) {
                        mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
                    }
                }
            }
      
        } catch (error) {
            mostrarMensaje('Ocurrió un error al validar las entregas pendientes:', 'error');
        }
    };

    const guardarCalificacion = async (event) => {
        setLoading(true);
        event.preventDefault();
        try {
            const calificacionData = {
                id_espacio_entrega: entrega.id_espacio_entrega,
                id_doc_entrega: entrega.id_doc_entrega,
                id_usuario_rol: entrega.id_usuario_rol,
                calificacion_aspecto: aspectos.map((aspecto) => ({
                    id_rubrica_aspecto: aspecto.id_rubrica_aspecto,
                    puntaje: puntaje[aspecto.id_aspecto] || 0,
                    comentario: comentario[aspecto.id_aspecto]?.trim() || '',
                })),
            };
            let response
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('calificacionData', JSON.stringify(calificacionData));
                formData.append('nombreArchivo', JSON.stringify(selectedFile.name));
                response = await fetch(`${apiBaseUrl}/usuario/documento/guardarCalificacion`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                response = await fetch(`${apiBaseUrl}/usuario/guardarCalificacion`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(calificacionData),
                });
            }
            const data = await response.json();
            if (response.status === 200) {
                setPuntaje({});
                setComentario({});
                setAspectos([]);
                setLoading(false);
                mostrarMensaje(data.message, 'success');
                await validarCambioEstado()
            } else if (response.status === 502) {
                mostrarMensaje(data.message, 'error');
            } else if (response.status === 203 || response.status === 400) {
                mostrarMensaje(data.message, 'warning');
            } else {
                mostrarMensaje(
                    'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.',
                    'error'
                );
            }
        } catch (error) {
            handleCancel();
            mostrarMensaje(
                'Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.',
                'error'
            );
        }
        setLoading(false);
    };


    const columnas = [
        { field: 'nombre_aspecto', headerName: 'Aspecto', flex: 0.5, minWidth: 200 },
        { field: 'puntaje_aspecto', headerName: 'Puntaje', flex: 0.1, minWidth: 100 },
        { field: 'comentario_aspecto', headerName: 'Comentario', flex: 0.4, minWidth: 150 },
    ]
    const formatFecha = (fecha) => {
        if (!fecha || !dayjs(fecha).isValid()) {
            return 'Fecha inválida';
        }
        return dayjs(fecha).format('DD-MM-YYYY HH:mm:ss');
    };

    const descargarArchivo = (url, nombreDocumento) => {
        fetch(url, {
            method: 'HEAD',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            if (response.status === 200) {
                return fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                mostrarMensaje('El archivo no existe, comuníquese con el administrador.', 'error');
                throw new Error('El archivo no existe');
            }
        })
        .then((response) => response.blob())
        .then((blob) => {
            saveAs(blob, nombreDocumento);
        })
        .catch((error) => {
            mostrarMensaje('Error al descargar el archivo, comuníquese con el administrador.', 'error');
        });
    };
    
    const handleDescargarArchivo = () => {
        if (docEntregado) {
            const url = `${apiBaseUrl}/descargar/${docEntregado.uuid}`;
        descargarArchivo(url, docEntregado.nombre_documento);
        }else{ 
        mostrarMensaje('Error al descargar el archivo, comuníquese con el administrador.', 'error');
        }
    };
    
    const handleDescargarRetroalimentacion = () => {
        if (docRetroalimentacion) {
        const url = `${apiBaseUrl}/descargar/retroalimentacion/${docRetroalimentacion.uuid}`;
        descargarArchivo(url, docRetroalimentacion.nombre_documento);
    }else{ 
        mostrarMensaje('Error al descargar el archivo, comuníquese con el administrador.', 'error');
        }
    };
    
    return (
        <div>
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
                                        {tipo === "cerrado" && (
                                            <>
                                                <Grid item xs={12} sm={6} md={4} lg={4}>
                                                    <Typography variant="h6" color="primary">
                                                        Nota
                                                    </Typography>
                                                    <TextField value={"Aún no puede calificar"} fullWidth />
                                                </Grid>
                                            </>
                                        )}
                                        {tipo === "vencido" && (
                                            <>
                                                <Grid item xs={12} sm={6} md={4} lg={4}>
                                                    <Typography variant="h6" color="primary">
                                                        Nota
                                                    </Typography>
                                                    <TextField value={"Ya no puede realizar la calificación"} fullWidth />
                                                </Grid>
                                            </>
                                        )}
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
                                        <Grid item xs={12} sm={6} md={4} lg={4}>
                                            <Typography variant="h6" color="primary">
                                                Documento entregado
                                            </Typography>

                                            <Button type="submit" endIcon={<DownloadTwoTone />} fullWidth variant='outlined' onClick={handleDescargarArchivo}> Descargar Archivo</Button>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            {tipo === "calificar" && aspectos.length > 0 && (
                                <Accordion sx={{ mt: 1, mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore color='secondary' fontSize="large" />}>
                                        <Typography variant="h2" color="secondary">
                                            Calificar entrega
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <form onSubmit={guardarCalificacion} style={{ width: '100%' }}>
                                                {aspectos.map((aspecto) => (
                                                    <Box key={aspecto.id_aspecto}>
                                                        <Stack spacing={1} marginBottom={2}>
                                                            <Typography variant="h4" color="secondary">
                                                                {aspecto.aspecto_nombre}
                                                            </Typography>
                                                            <Typography variant="h6" color="primary">
                                                                Puntaje *
                                                            </Typography>
                                                            <TextField
                                                                type="number"
                                                                value={puntaje[aspecto.id_aspecto] || ''}
                                                                onChange={(e) => handlePuntajeChange(aspecto.id_aspecto, e.target.value)}
                                                                inputProps={{
                                                                    min: 0,
                                                                    max: aspecto.aspecto_puntaje,
                                                                }}
                                                                required
                                                                error={
                                                                    !puntaje[aspecto.id_aspecto] ||
                                                                    puntaje[aspecto.id_aspecto] > aspecto.aspecto_puntaje ||
                                                                    puntaje[aspecto.id_aspecto] < 0
                                                                }
                                                                helperText={`Valor debe estar entre 0 y ${aspecto.aspecto_puntaje}`}
                                                                fullWidth
                                                            />
                                                            <Typography variant="h6" color="primary">
                                                                Comentario *
                                                            </Typography>
                                                            <TextField
                                                                value={comentario[aspecto.id_aspecto] || ''}
                                                                onChange={(e) => handleComentarioChange(aspecto.id_aspecto, e.target.value)}
                                                                minRows={1}
                                                                required
                                                                fullWidth
                                                                multiline
                                                                error={!comentario[aspecto.id_aspecto]}
                                                                helperText={!comentario[aspecto.id_aspecto] && 'Por favor, ingresa un comentario'}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                ))}
                                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                                    Documento
                                                </Typography>
                                                <TextField fullWidth placeholder="Agregue el documento" type='file' onChange={handleInputChange} />

                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
                                                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} sx={{ width: 250 }}>
                                                        Guardar
                                                    </Button>
                                                </Box>
                                            </form>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            )}
                            {tipo === "calificado" && (
                                <>
                                    {existeDocRetroalimentacion && (
                                        <>
                                            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                                Documento retroalimentación
                                            </Typography>
                                            <Button type="submit" startIcon={<Download />} variant='outlined' onClick={handleDescargarRetroalimentacion} sx={{ width: 250 }}> Descargar</Button>
                                        </>
                                    )}
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
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                </DialogActions>
            </Dialog >
         
        </div>
    )
}

CalificarEntrega.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    entrega: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    tipo: PropTypes.string.isRequired
};

export default CalificarEntrega;
