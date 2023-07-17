import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { tokens } from '../../../../theme';
import { useSelector } from 'react-redux';
import { selectToken } from '../../../../store/authSlice';
import {
    Typography,
    useTheme,
    CircularProgress,
    Box,
    TextField,
    CssBaseline,
    Button,
    DialogTitle,
    Dialog,
    DialogActions,
    DialogContent,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';

import { useSnackbar } from 'notistack';
import { SaveOutlined } from '@mui/icons-material';

function CrearRubrica(props) {
    const { onClose, onSubmit,open } = props;
    const { enqueueSnackbar } = useSnackbar();

    const token = useSelector(selectToken);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useState(true);

    const [rubricaNombre, setRubricaNombre] = useState('');
    const [rubricaDescripcion, setRubricaDescripcion] = useState('');
    const [selectedAspectos, setSelectedAspectos] = useState([]);
    const [aspectoPuntajes, setAspectoPuntajes] = useState({});
    const [aspectos, setAspectos] = useState([]);
    const mostrarMensaje = (mensaje, variante) => {
        enqueueSnackbar(mensaje, { variant: variante });
    };

    const handleEntering = () => {
        obtenerAspectos()
        setLoading(false);
    };
    const handleCancel = () => {
        onClose();
        setLoading(true);
    };

    const obtenerAspectos = async () => {
        try {
            const response = await fetch("http://localhost:5000/comite/aspecto", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!data.success) {
                mostrarMensaje(data.message, "error");
            } else if (response.status === 203) {
                mostrarMensaje(data.message, "warning");
            } else if (response.status === 200) {
                setAspectos(data.aspectos);
            }
        } catch (error) {
            mostrarMensaje("Lo siento, ha ocurrido un error al obtener los aspectos. Por favor, intente de nuevo más tarde.", "error");
        }
    };

    const crearRubrica = async (event) => {
        event.preventDefault();
        const puntajesSum = selectedAspectos.reduce((sum, aspecto) => sum + (aspectoPuntajes[aspecto.id] || 0), 0);
        if (puntajesSum === 100) {
            try {
                const rubricaData = {
                    nombre: rubricaNombre,
                    descripcion: rubricaDescripcion,
                    aspectos: selectedAspectos.map((aspecto) => ({
                        ...aspecto,
                        puntaje: aspectoPuntajes[aspecto.id] || 0,
                    })),
                };

                const response = await fetch('http://localhost:5000/comite/crearRubrica', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(rubricaData),
                });
                const data = await response.json();
                if (data.success) {
                    setRubricaNombre('');
                    setRubricaDescripcion('');
                    setSelectedAspectos([]);
                    setAspectoPuntajes({});
                    setAspectos([])
                    onSubmit()
                    mostrarMensaje(data.message, "success");
                } else {
                    mostrarMensaje(data.message, "error");
                }
            } catch (error) {
                mostrarMensaje("Lo siento, ha ocurrido un error de autenticación. Por favor, intente de nuevo más tarde o póngase en contacto con el administrador del sistema para obtener ayuda.", "error");
            }
        } else {
            mostrarMensaje("La suma de los aspectos debe ser 100", "error");
        }
    };
    const handleAspectoSelect = (event) => {
        const aspectoId = event.target.value;
        const selectedAspecto = aspectos.find((aspecto) => aspecto.id === aspectoId);
        const isAspectoSelected = selectedAspectos.some((aspecto) => aspecto.id === aspectoId);
        if (!isAspectoSelected) {
            setSelectedAspectos([...selectedAspectos, selectedAspecto]);
        }
    };

    const handleAspectoRemove = (aspectoId) => {
        const updatedSelectedAspectos = selectedAspectos.filter((aspecto) => aspecto.id !== aspectoId);
        setSelectedAspectos(updatedSelectedAspectos);
        const updatedAspectoPuntajes = { ...aspectoPuntajes };
        delete updatedAspectoPuntajes[aspectoId];
        setAspectoPuntajes(updatedAspectoPuntajes);
    };

    const handleAspectoPuntajeChange = (aspectoId, newPuntaje) => {
        const parsedPuntaje = parseInt(newPuntaje);
        setAspectoPuntajes({ ...aspectoPuntajes, [aspectoId]: parsedPuntaje });
    };

    const handleNombreRubChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setRubricaNombre(isOnlyWhitespace ? "" : value);
    };

    const handleDescripcionRubChange = (value) => {
        const isOnlyWhitespace = /^\s*$/.test(value);
        setRubricaDescripcion(isOnlyWhitespace ? "" : value);
    };

    return (
        <Dialog open={open} fullWidth maxWidth="md" TransitionProps={{ onEntering: handleEntering }} onClose={handleCancel}>
            <CssBaseline />
            <DialogTitle variant="h1" color={colors.primary[100]}>
                CREAR RUBRICA
            </DialogTitle>
            <form onSubmit={crearRubrica}>
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color={colors.primary[100]}>
                                Nombre de la rubrica
                            </Typography>
                            <TextField
                                value={rubricaNombre}
                                onChange={(e) => handleNombreRubChange(e.target.value)}
                                error={!rubricaNombre}
                                helperText={'Ingresa el nombre de la rubrica.'}
                                required
                                fullWidth
                            />
                            <Typography variant="h6" color={colors.primary[100]}>
                                Descripción
                            </Typography>
                            <TextField
                                multiline
                                rows={2}
                                value={rubricaDescripcion}
                                onChange={(e) => handleDescripcionRubChange(e.target.value)}
                                error={!rubricaDescripcion}
                                helperText={'Ingresa la descripción de la rubrica.'}
                                required
                                fullWidth
                            />

                            <FormControl fullWidth margin="normal">
                                <Typography variant="h6" color={colors.primary[100]}>
                                    Seleccionar aspectos
                                </Typography>
                                <Select
                                    value=""
                                    onChange={handleAspectoSelect}
                                    renderValue={() => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {selectedAspectos.map((aspecto) => (
                                                <Button
                                                    key={aspecto.id}
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => handleAspectoRemove(aspecto.id)}
                                                >
                                                    {aspecto.nombre}
                                                </Button>
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {aspectos.map((aspecto) => (
                                        <MenuItem key={aspecto.id} value={aspecto.id}>
                                            {aspecto.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Typography variant="h4" color={colors.secundary[100]}>
                                Aspectos seleccionados
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Puntaje</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedAspectos.map((aspecto) => (
                                            <TableRow key={aspecto.id}>
                                                <TableCell>{aspecto.nombre}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={aspectoPuntajes[aspecto.id] || 0}
                                                        onChange={(e) => handleAspectoPuntajeChange(aspecto.id, e.target.value)}
                                                        inputProps={{
                                                            min: 1,
                                                            max: 100,
                                                        }}
                                                        required
                                                        error={!aspectoPuntajes[aspecto.id] ||
                                                            aspectoPuntajes[aspecto.id] > 100 ||
                                                            aspectoPuntajes[aspecto.id] < 1
                                                        }
                                                        helperText={"El puntaje debe estar entre 1 y 100"}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() => handleAspectoRemove(aspecto.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cerrar</Button>
                    <Button type="submit" variant="contained" startIcon={<SaveOutlined />} >
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

CrearRubrica.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default CrearRubrica;
